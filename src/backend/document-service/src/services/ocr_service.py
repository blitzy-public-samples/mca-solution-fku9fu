# Standard library imports - Python 3.11
import os
from pathlib import Path
import tempfile
from typing import List, Tuple, Dict

# Third-party imports
import pytesseract  # version: 0.3.10
from PIL import Image, ImageEnhance  # version: 9.5.0
import numpy as np  # version: 1.24.0
from pdf2image import convert_from_bytes  # version: 1.16.3

# Internal imports
from ..config.settings import Config
from ..utils.logger import get_logger
from ..models.document import Document

# Human Tasks:
# 1. Install Tesseract OCR engine (version 4.1.1 or higher) on all deployment environments
# 2. Configure Tesseract language data files for supported languages
# 3. Verify GPU support for image processing optimization if available
# 4. Set up monitoring alerts for OCR accuracy thresholds

# Initialize logger
logger = get_logger(__name__)

# Global constants
SUPPORTED_IMAGE_FORMATS = ['PNG', 'JPEG', 'TIFF', 'BMP']
SUPPORTED_PDF_VERSION = '1.7'

def preprocess_image(image: Image.Image) -> Image.Image:
    """Preprocesses image for optimal OCR performance using advanced image processing techniques.
    
    Addresses requirement: Document Processing - OCR processing and data extraction
    
    Args:
        image: PIL Image object to preprocess
        
    Returns:
        Preprocessed PIL Image ready for OCR
    """
    try:
        # Convert to grayscale
        gray_image = image.convert('L')
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(gray_image)
        contrast_image = enhancer.enhance(1.5)
        
        # Apply adaptive thresholding
        np_image = np.array(contrast_image)
        blur = cv2.GaussianBlur(np_image, (5, 5), 0)
        thresh = cv2.adaptiveThreshold(
            blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Perform deskewing if needed
        coords = np.column_stack(np.where(thresh > 0))
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = 90 + angle
        if abs(angle) > 0.5:
            (h, w) = thresh.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            thresh = cv2.warpAffine(
                thresh, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
            )
        
        # Convert back to PIL Image
        processed_image = Image.fromarray(thresh)
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(processed_image)
        final_image = enhancer.enhance(1.5)
        
        logger.info("Image preprocessing completed successfully")
        return final_image
        
    except Exception as e:
        logger.error(f"Error during image preprocessing: {str(e)}")
        raise

def convert_pdf_to_images(pdf_content: bytes) -> List[Image.Image]:
    """Converts PDF document pages to images for OCR processing with version validation.
    
    Addresses requirement: Document Processing - Support for PDF document processing
    
    Args:
        pdf_content: PDF file content in bytes
        
    Returns:
        List of PIL Image objects for each PDF page
    """
    try:
        # Create temporary file for PDF content
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_pdf:
            temp_pdf.write(pdf_content)
            temp_pdf_path = temp_pdf.name
        
        try:
            # Validate PDF version
            with open(temp_pdf_path, 'rb') as pdf_file:
                pdf_version = pdf_file.readline().decode('utf-8')
                if SUPPORTED_PDF_VERSION not in pdf_version:
                    raise ValueError(f"Unsupported PDF version. Expected {SUPPORTED_PDF_VERSION}")
            
            # Convert PDF to images
            images = convert_from_bytes(
                pdf_content,
                dpi=300,
                fmt='PNG',
                grayscale=True,
                thread_count=os.cpu_count()
            )
            
            logger.info(f"Successfully converted PDF to {len(images)} images")
            return images
            
        finally:
            # Clean up temporary file
            os.unlink(temp_pdf_path)
            
    except Exception as e:
        logger.error(f"Error converting PDF to images: {str(e)}")
        raise

class OCRProcessor:
    """Handles OCR processing for MCA application documents with high accuracy using Tesseract OCR.
    
    Addresses requirements:
    - Document Processing: OCR processing and data extraction
    - Accuracy: ≥ 99% accuracy in data extraction
    - Processing Time: < 5 minutes per application
    """
    
    def __init__(self, config: Config):
        """Initializes OCR processor with configuration and Tesseract settings.
        
        Args:
            config: Configuration instance with OCR settings
        """
        self.config = config
        self.ocr_settings = config.ocr_config
        
        # Configure Tesseract path
        if not Path(config.tesseract_path).exists():
            raise ValueError(f"Tesseract not found at {config.tesseract_path}")
        pytesseract.pytesseract.tesseract_cmd = config.tesseract_path
        
        logger.info("OCR processor initialized with configuration")

    def process_document(self, document: Document, content: bytes) -> Dict:
        """Processes a document through OCR and extracts text content with high accuracy.
        
        Addresses requirements:
        - Document Processing: OCR processing with 99% accuracy
        - Processing Time: Process within 5 minutes
        
        Args:
            document: Document instance to process
            content: Document content in bytes
            
        Returns:
            Dictionary containing OCR results and confidence scores
        """
        try:
            start_time = time.time()
            images_to_process = []
            
            # Handle different document formats
            if document.mime_type == 'application/pdf':
                images_to_process = convert_pdf_to_images(content)
            else:
                image = Image.open(io.BytesIO(content))
                if image.format not in SUPPORTED_IMAGE_FORMATS:
                    raise ValueError(f"Unsupported image format: {image.format}")
                images_to_process = [image]
            
            # Process each image
            results = []
            confidence_scores = []
            
            for idx, image in enumerate(images_to_process):
                # Preprocess image
                processed_image = preprocess_image(image)
                
                # Perform OCR with custom configuration
                ocr_result = pytesseract.image_to_data(
                    processed_image,
                    lang=self.ocr_settings['language'],
                    config=f"--psm {self.ocr_settings['psm']} --oem {self.ocr_settings['oem']}"
                )
                
                # Parse results and calculate confidence
                page_text = []
                page_confidence = []
                
                for line in ocr_result.splitlines()[1:]:  # Skip header
                    parts = line.split('\t')
                    if len(parts) > 11 and parts[11].strip():  # Text content exists
                        conf = float(parts[10]) if parts[10] != '-1' else 0
                        if conf > 0:  # Only include confident results
                            page_text.append(parts[11])
                            page_confidence.append(conf)
                
                if page_confidence:
                    avg_confidence = sum(page_confidence) / len(page_confidence)
                    confidence_scores.append(avg_confidence)
                    results.append('\n'.join(page_text))
                
                logger.info(f"Processed page {idx + 1} with confidence: {avg_confidence:.2f}%")
            
            # Compile final results
            processing_time = time.time() - start_time
            overall_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
            
            ocr_results = {
                'text': '\n\n'.join(results),
                'confidence': overall_confidence,
                'processing_time': processing_time,
                'pages_processed': len(images_to_process),
                'metadata': {
                    'dpi': self.ocr_settings['dpi'],
                    'language': self.ocr_settings['language'],
                    'psm': self.ocr_settings['psm'],
                    'oem': self.ocr_settings['oem']
                }
            }
            
            # Validate results
            validation_status, metrics = self.validate_results(ocr_results)
            if not validation_status:
                logger.warning(f"OCR results did not meet quality thresholds: {metrics}")
            
            # Store results
            document.store_ocr_result(ocr_results)
            
            logger.info(
                f"Document processing completed",
                extra={
                    'document_id': document.id,
                    'confidence': overall_confidence,
                    'processing_time': processing_time,
                    'pages': len(images_to_process)
                }
            )
            
            return ocr_results
            
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            raise

    def extract_fields(self, document_type: str, ocr_results: Dict) -> Dict:
        """Extracts specific fields from OCR results based on document type with validation.
        
        Addresses requirement: Document Processing - Structured data extraction
        
        Args:
            document_type: Type of document being processed
            ocr_results: OCR processing results
            
        Returns:
            Dictionary of extracted field values with confidence scores
        """
        try:
            extracted_fields = {}
            text = ocr_results['text']
            
            # Define field extraction patterns based on document type
            field_patterns = {
                'ISO_APPLICATION': {
                    'business_name': r'Business\s+Name:?\s*([^\n]+)',
                    'ein': r'EIN:?\s*(\d{2}-?\d{7})',
                    'address': r'Address:?\s*([^\n]+)',
                    'phone': r'Phone:?\s*([\d-]+)',
                    'email': r'Email:?\s*([^\s]+@[^\s]+)'
                },
                'BANK_STATEMENT': {
                    'account_number': r'Account\s*#:?\s*(\d+)',
                    'balance': r'Balance:?\s*\$?([\d,]+\.\d{2})',
                    'period': r'Statement\s+Period:?\s*([^\n]+)'
                }
            }
            
            if document_type not in field_patterns:
                raise ValueError(f"Unsupported document type: {document_type}")
            
            # Extract fields using regex patterns
            import re
            for field, pattern in field_patterns[document_type].items():
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    value = match.group(1).strip()
                    # Calculate field-specific confidence
                    field_confidence = self._calculate_field_confidence(
                        value, ocr_results['confidence']
                    )
                    extracted_fields[field] = {
                        'value': value,
                        'confidence': field_confidence
                    }
            
            logger.info(
                f"Field extraction completed",
                extra={
                    'document_type': document_type,
                    'fields_found': len(extracted_fields)
                }
            )
            
            return extracted_fields
            
        except Exception as e:
            logger.error(f"Error extracting fields: {str(e)}")
            raise

    def validate_results(self, ocr_results: Dict) -> Tuple[bool, Dict]:
        """Validates OCR results against quality thresholds for 99% accuracy.
        
        Addresses requirement: Accuracy - ≥ 99% accuracy in data extraction
        
        Args:
            ocr_results: OCR processing results to validate
            
        Returns:
            Tuple of validation status and quality metrics
        """
        try:
            # Define validation thresholds
            thresholds = {
                'min_confidence': 99.0,  # Required 99% accuracy
                'max_processing_time': 300,  # 5 minutes max
                'min_text_length': 50,  # Minimum expected text length
                'max_error_rate': 0.01  # Maximum 1% error rate
            }
            
            # Calculate quality metrics
            metrics = {
                'confidence': ocr_results['confidence'],
                'processing_time': ocr_results['processing_time'],
                'text_length': len(ocr_results['text']),
                'error_rate': 100 - ocr_results['confidence']
            }
            
            # Validate against thresholds
            validation_status = (
                metrics['confidence'] >= thresholds['min_confidence'] and
                metrics['processing_time'] <= thresholds['max_processing_time'] and
                metrics['text_length'] >= thresholds['min_text_length'] and
                metrics['error_rate'] <= thresholds['max_error_rate']
            )
            
            logger.info(
                f"OCR validation completed",
                extra={
                    'validation_status': validation_status,
                    'metrics': metrics
                }
            )
            
            return validation_status, metrics
            
        except Exception as e:
            logger.error(f"Error validating OCR results: {str(e)}")
            raise

    def _calculate_field_confidence(self, value: str, base_confidence: float) -> float:
        """Calculates field-specific confidence score based on value characteristics.
        
        Args:
            value: Extracted field value
            base_confidence: Base OCR confidence score
            
        Returns:
            Field-specific confidence score
        """
        # Apply field-specific confidence adjustments
        confidence = base_confidence
        
        # Adjust for value length
        if len(value) < 3:
            confidence *= 0.9
        
        # Adjust for expected patterns
        if any(c.isdigit() for c in value):
            confidence *= 0.95  # Numbers are more error-prone
        
        # Adjust for special characters
        if any(not c.isalnum() for c in value):
            confidence *= 0.98
        
        return round(confidence, 2)