# Third-party imports
import pytest  # version: 7.3.1
import numpy as np  # version: 1.24.0
from PIL import Image, ImageDraw, ImageFont  # version: 9.5.0
import io
import time
from pathlib import Path

# Internal imports
from ..src.services.ocr_service import OCRProcessor
from ..src.models.document import Document
from ..src.config.settings import Config

# Human Tasks:
# 1. Install test fonts for image generation (e.g., DejaVu Sans)
# 2. Configure test environment variables in .env.test
# 3. Set up test data directory with sample documents
# 4. Ensure Tesseract is installed in test environment

@pytest.mark.asyncio
class TestOCRProcessor:
    """Test suite for OCR processing functionality with comprehensive coverage.
    
    Addresses requirements:
    - OCR Processing Accuracy: ≥ 99% accuracy in data extraction
    - Processing Time: < 5 minutes per application
    - Document Processing: OCR processing and data extraction
    """

    async def setup_method(self, method):
        """Setup test environment before each test method."""
        # Initialize test configuration
        self.config = Config()
        self.config.environment = "test"
        
        # Create test processor instance
        self.processor = OCRProcessor(self.config)
        
        # Setup test data directory
        self.test_data_dir = Path(__file__).parent / "test_data"
        self.test_data_dir.mkdir(exist_ok=True)

    async def teardown_method(self, method):
        """Cleanup test environment after each test method."""
        # Clean up test files
        for file in self.test_data_dir.glob("*"):
            file.unlink()
        self.test_data_dir.rmdir()

    def create_test_image(self, text: str, size=(800, 600)) -> bytes:
        """Creates a test image with known text content."""
        image = Image.new('RGB', size, color='white')
        draw = ImageDraw.Draw(image)
        font = ImageFont.load_default()
        draw.text((50, 50), text, font=font, fill='black')
        
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        return img_byte_arr.getvalue()

    def create_test_pdf(self, texts: list) -> bytes:
        """Creates a test PDF with multiple pages of known content."""
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        
        for text in texts:
            c.drawString(100, 750, text)
            c.showPage()
        c.save()
        
        return buffer.getvalue()

    @pytest.mark.asyncio
    async def test_ocr_processor_initialization(self):
        """Tests proper initialization of OCRProcessor with configuration.
        
        Addresses requirement: Document Processing - OCR processing and data extraction
        """
        # Verify OCR settings loaded correctly
        assert self.processor.ocr_settings == self.config.ocr_config
        
        # Check Tesseract initialization
        assert Path(self.config.tesseract_path).exists()
        
        # Validate preprocessing parameters
        assert hasattr(self.processor, 'config')
        assert self.processor.config.environment == "test"

    @pytest.mark.asyncio
    async def test_process_document_image(self):
        """Tests OCR processing of image documents with accuracy validation.
        
        Addresses requirements:
        - OCR Processing Accuracy: ≥ 99% accuracy
        - Processing Time: < 5 minutes per application
        """
        # Create test image with known text
        test_text = "Sample Business Document\nEIN: 12-3456789\nBusiness Name: Test Corp"
        image_content = self.create_test_image(test_text)
        
        # Create test document
        document = Document(
            application_id="test-app-001",
            file_name="test.png",
            file_type="png",
            mime_type="image/png",
            file_size=len(image_content),
            created_by="test-user"
        )
        
        # Process document
        start_time = time.time()
        result = await self.processor.process_document(document, image_content)
        processing_time = time.time() - start_time
        
        # Verify processing time
        assert processing_time < 300  # Less than 5 minutes
        
        # Verify accuracy
        assert result['confidence'] >= 99.0
        assert "Sample Business Document" in result['text']
        assert "12-3456789" in result['text']
        
        # Verify results stored
        assert document.ocr_result == result

    @pytest.mark.asyncio
    async def test_process_document_pdf(self):
        """Tests OCR processing of PDF documents with multi-page support.
        
        Addresses requirements:
        - Document Processing: Support for PDF processing
        - Processing Time: < 5 minutes per application
        """
        # Create multi-page test PDF
        test_pages = [
            "Page 1: Business License\nCompany: Test Corp",
            "Page 2: Financial Statement\nRevenue: $100,000"
        ]
        pdf_content = self.create_test_pdf(test_pages)
        
        # Create test document
        document = Document(
            application_id="test-app-002",
            file_name="test.pdf",
            file_type="pdf",
            mime_type="application/pdf",
            file_size=len(pdf_content),
            created_by="test-user"
        )
        
        # Process document
        start_time = time.time()
        result = await self.processor.process_document(document, pdf_content)
        processing_time = time.time() - start_time
        
        # Verify processing time and pages
        assert processing_time < 300
        assert result['pages_processed'] == 2
        
        # Verify content extraction
        assert "Business License" in result['text']
        assert "Financial Statement" in result['text']

    @pytest.mark.asyncio
    async def test_field_extraction(self):
        """Tests extraction of specific fields from OCR results with validation.
        
        Addresses requirement: OCR Processing Accuracy - ≥ 99% accuracy in data extraction
        """
        # Create test document with known fields
        test_text = """
        Business Name: Test Corporation
        EIN: 98-7654321
        Address: 123 Test St, Suite 100
        Phone: 555-123-4567
        Email: test@testcorp.com
        """
        image_content = self.create_test_image(test_text)
        
        # Process document
        document = Document(
            application_id="test-app-003",
            file_name="test.png",
            file_type="png",
            mime_type="image/png",
            file_size=len(image_content),
            created_by="test-user"
        )
        
        ocr_result = await self.processor.process_document(document, image_content)
        
        # Extract fields
        fields = await self.processor.extract_fields("ISO_APPLICATION", ocr_result)
        
        # Verify field extraction
        assert fields['business_name']['value'] == "Test Corporation"
        assert fields['ein']['value'] == "98-7654321"
        assert fields['phone']['value'] == "555-123-4567"
        assert fields['email']['value'] == "test@testcorp.com"
        
        # Verify confidence scores
        assert all(field['confidence'] >= 99.0 for field in fields.values())

    @pytest.mark.asyncio
    async def test_ocr_accuracy(self):
        """Tests OCR accuracy meets 99% requirement across document types.
        
        Addresses requirement: OCR Processing Accuracy - ≥ 99% accuracy in data extraction
        """
        # Test with various content types
        test_cases = [
            "Standard Text Document\nSimple content for testing",
            "NUMBERS AND SPECIAL CHARS: 12345 #$%",
            "Mixed Case Text with Symbols & Numbers: 98.7%",
        ]
        
        accuracies = []
        for test_text in test_cases:
            image_content = self.create_test_image(test_text)
            document = Document(
                application_id=f"test-app-{len(accuracies)}",
                file_name="test.png",
                file_type="png",
                mime_type="image/png",
                file_size=len(image_content),
                created_by="test-user"
            )
            
            result = await self.processor.process_document(document, image_content)
            accuracies.append(result['confidence'])
        
        # Verify accuracy requirements
        assert min(accuracies) >= 99.0
        assert np.mean(accuracies) >= 99.5

    @pytest.mark.asyncio
    async def test_processing_performance(self):
        """Tests OCR processing meets performance requirements under load.
        
        Addresses requirement: Processing Time - < 5 minutes per application
        """
        # Create batch of test documents
        batch_size = 5
        test_documents = []
        
        for i in range(batch_size):
            test_text = f"Test Document {i}\nContent for performance testing"
            image_content = self.create_test_image(test_text)
            document = Document(
                application_id=f"test-app-perf-{i}",
                file_name=f"test_{i}.png",
                file_type="png",
                mime_type="image/png",
                file_size=len(image_content),
                created_by="test-user"
            )
            test_documents.append((document, image_content))
        
        # Process batch and measure time
        start_time = time.time()
        for document, content in test_documents:
            result = await self.processor.process_document(document, content)
            assert result['confidence'] >= 99.0
        
        total_time = time.time() - start_time
        avg_time = total_time / batch_size
        
        # Verify performance requirements
        assert avg_time < 300  # Less than 5 minutes per document