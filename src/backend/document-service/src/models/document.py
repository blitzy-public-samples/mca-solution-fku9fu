# Third-party imports
from pydantic.dataclasses import dataclass  # version: 2.0.0
from datetime import datetime
import uuid

# Internal imports
from ..config.settings import Config
from ..utils.logger import get_logger

# Initialize logger
logger = get_logger(__name__)

# Define valid document types and processing statuses
DOCUMENT_TYPES = ['ISO_APPLICATION', 'BANK_STATEMENT', 'VOIDED_CHECK', 'BUSINESS_LICENSE', 'TAX_RETURN']
PROCESSING_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']

# Human Tasks:
# 1. Configure S3 bucket CORS policy for document uploads
# 2. Set up S3 lifecycle rules for document retention
# 3. Configure KMS key permissions for document encryption
# 4. Set up CloudWatch alarms for document processing metrics

@dataclass
class Document:
    """Represents a document in the MCA application processing system.
    
    Addresses requirements:
    - Document Processing: Support for classification and OCR processing
    - Data Management: Secure document storage with S3 integration
    - Security: Encrypted document storage with access control
    """
    # Required fields
    id: str
    application_id: str
    file_name: str
    file_type: str
    mime_type: str
    file_size: int
    storage_path: str
    document_type: str
    processing_status: str
    metadata: dict
    classification_result: str
    ocr_result: dict
    created_at: datetime
    updated_at: datetime
    created_by: str
    updated_by: str

    def __init__(
        self,
        application_id: str,
        file_name: str,
        file_type: str,
        mime_type: str,
        file_size: int,
        created_by: str
    ):
        """Initialize a new Document instance with required fields and defaults.
        
        Args:
            application_id (str): Associated application identifier
            file_name (str): Original file name
            file_type (str): File extension or type
            mime_type (str): MIME type of the document
            file_size (int): Size of file in bytes
            created_by (str): User identifier who created the document
        """
        # Generate unique document ID
        self.id = str(uuid.uuid4())
        
        # Set required fields
        self.application_id = application_id
        self.file_name = file_name
        self.file_type = file_type
        self.mime_type = mime_type
        self.file_size = file_size
        self.created_by = created_by
        self.updated_by = created_by
        
        # Initialize optional fields
        self.storage_path = None
        self.document_type = None
        self.processing_status = 'PENDING'
        self.metadata = {}
        self.classification_result = None
        self.ocr_result = {}
        
        # Set timestamps
        current_time = datetime.utcnow()
        self.created_at = current_time
        self.updated_at = current_time
        
        logger.info(f"Created new document record: {self.id} for application: {self.application_id}")

    async def upload_to_storage(self, file_content: bytes) -> str:
        """Upload document to secure S3 storage with server-side encryption.
        
        Addresses requirement: Security - Secure document storage with encryption
        
        Args:
            file_content (bytes): Binary content of the file to upload
            
        Returns:
            str: S3 storage path of uploaded document
            
        Raises:
            Exception: If upload fails or encryption is not properly configured
        """
        try:
            # Get S3 client with encryption settings
            s3_client = Config().get_s3_client()
            
            # Generate secure storage path
            year = datetime.utcnow().strftime('%Y')
            month = datetime.utcnow().strftime('%m')
            day = datetime.utcnow().strftime('%d')
            filename = f"{self.id}-{self.file_name}"
            storage_path = f"documents/{year}/{month}/{day}/{filename}"
            
            # Upload with server-side encryption
            s3_client.put_object(
                Bucket=Config().s3_bucket,
                Key=storage_path,
                Body=file_content,
                ServerSideEncryption='aws:kms',
                SSEKMSKeyId=Config().kms_key_id,
                Metadata={
                    'application_id': self.application_id,
                    'document_id': self.id,
                    'content_type': self.mime_type
                }
            )
            
            # Update storage path and timestamp
            self.storage_path = storage_path
            self.updated_at = datetime.utcnow()
            
            logger.info(f"Document {self.id} uploaded successfully to {storage_path}")
            return storage_path
            
        except Exception as e:
            logger.error(f"Failed to upload document {self.id}: {str(e)}")
            raise

    def update_processing_status(self, status: str, result_data: dict) -> None:
        """Update document processing status and related metadata.
        
        Addresses requirement: Document Processing - Processing state management
        
        Args:
            status (str): New processing status
            result_data (dict): Additional processing result data
            
        Raises:
            ValueError: If status is invalid
        """
        if status not in PROCESSING_STATUSES:
            raise ValueError(f"Invalid processing status: {status}")
        
        self.processing_status = status
        self.metadata.update(result_data)
        self.updated_at = datetime.utcnow()
        
        logger.info(
            f"Updated document {self.id} status to {status}",
            extra={
                'document_id': self.id,
                'application_id': self.application_id,
                'status': status,
                'metadata': result_data
            }
        )

    def set_classification(self, document_type: str, classification_metadata: dict) -> None:
        """Set document classification result and type with validation.
        
        Addresses requirement: Document Processing - Document classification
        
        Args:
            document_type (str): Classified document type
            classification_metadata (dict): Classification details and confidence scores
            
        Raises:
            ValueError: If document type is invalid
        """
        if document_type not in DOCUMENT_TYPES:
            raise ValueError(f"Invalid document type: {document_type}")
        
        self.document_type = document_type
        self.classification_result = document_type
        self.metadata['classification'] = classification_metadata
        self.updated_at = datetime.utcnow()
        
        logger.info(
            f"Document {self.id} classified as {document_type}",
            extra={
                'document_id': self.id,
                'document_type': document_type,
                'confidence_score': classification_metadata.get('confidence', 0)
            }
        )

    def store_ocr_result(self, ocr_data: dict) -> None:
        """Store OCR processing results for the document with validation.
        
        Addresses requirement: Document Processing - OCR processing and data extraction
        
        Args:
            ocr_data (dict): Extracted text and metadata from OCR processing
            
        Raises:
            ValueError: If OCR data is invalid or missing required fields
        """
        required_fields = {'text', 'confidence', 'processing_time'}
        if not all(field in ocr_data for field in required_fields):
            raise ValueError("OCR data missing required fields")
        
        self.ocr_result = ocr_data
        self.metadata['ocr_processing'] = {
            'timestamp': datetime.utcnow().isoformat(),
            'duration': ocr_data['processing_time'],
            'confidence': ocr_data['confidence']
        }
        self.updated_at = datetime.utcnow()
        
        logger.info(
            f"OCR results stored for document {self.id}",
            extra={
                'document_id': self.id,
                'text_length': len(ocr_data.get('text', '')),
                'confidence': ocr_data.get('confidence', 0),
                'processing_time': ocr_data.get('processing_time', 0)
            }
        )