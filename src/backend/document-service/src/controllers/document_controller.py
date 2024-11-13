# Standard library imports
import logging
from typing import Dict, Optional
from datetime import datetime

# Third-party imports
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends  # version: 0.100.0
from pydantic import BaseModel, Field  # version: 2.0.0

# Internal imports
from ..services.classification_service import DocumentClassifier
from ..services.ocr_service import OCRProcessor
from ..models.document import Document
from ..utils.logger import get_logger
from ..utils.decorators import validate_file_type, validate_file_size, validate_document_access, background_task, handle_processing_errors

# Initialize router and logger
router = APIRouter(prefix='/api/v1/documents', tags=['Documents'])
logger = get_logger(__name__)

# Request/Response Models
class DocumentUploadRequest(BaseModel):
    application_id: str = Field(..., description="Associated application identifier")
    user_id: str = Field(..., description="User performing the upload")

class DocumentResponse(BaseModel):
    document_id: str
    application_id: str
    document_type: Optional[str]
    processing_status: str
    confidence_score: Optional[float]
    processing_time: Optional[float]
    metadata: Dict

class DocumentController:
    """Main controller class for document processing operations with high performance and accuracy.
    
    Addresses requirements:
    - Document Processing: Document classification, OCR processing with 99% accuracy
    - Processing Time: Process documents within 5 minutes per application
    - Automation Rate: Enable 93% automation rate through efficient processing
    """
    
    def __init__(self, classifier: DocumentClassifier, ocr_processor: OCRProcessor):
        """Initialize controller with required services.
        
        Args:
            classifier: Document classification service instance
            ocr_processor: OCR processing service instance
        """
        self.classifier = classifier
        self.ocr_processor = ocr_processor
        self.logger = logger

    async def handle_upload(
        self, 
        file: UploadFile, 
        application_id: str, 
        user_id: str
    ) -> Document:
        """Coordinates document upload and processing pipeline with validation.
        
        Addresses requirements:
        - Document Processing: Efficient document upload and processing
        - Processing Time: Quick file validation and processing initiation
        
        Args:
            file: Uploaded file object
            application_id: Associated application identifier
            user_id: User performing the upload
            
        Returns:
            Document: Processed document instance
            
        Raises:
            HTTPException: If file validation or processing fails
        """
        try:
            # Create document record
            document = Document(
                application_id=application_id,
                file_name=file.filename,
                file_type=file.filename.split('.')[-1].lower(),
                mime_type=file.content_type,
                file_size=0,  # Will be updated after reading file
                created_by=user_id
            )
            
            # Read file content
            content = await file.read()
            document.file_size = len(content)
            
            # Upload to secure storage
            await document.upload_to_storage(content)
            
            # Initialize processing
            await self._process_document(document)
            
            self.logger.info(
                f"Document upload handled successfully",
                extra={
                    'document_id': document.id,
                    'application_id': application_id,
                    'file_name': file.filename,
                    'file_size': document.file_size
                }
            )
            
            return document
            
        except Exception as e:
            self.logger.error(f"Document upload failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Document upload failed: {str(e)}"
            )

# Controller instance and endpoints
controller = DocumentController(
    classifier=DocumentClassifier(),
    ocr_processor=OCRProcessor()
)

@router.post('/', response_model=DocumentResponse)
@validate_file_type(['pdf', 'png', 'jpg', 'jpeg', 'tiff'])
@validate_file_size(max_size_mb=10)
async def upload_document(
    file: UploadFile = File(...),
    application_id: str = None,
    user_id: str = None
) -> DocumentResponse:
    """Handle document upload endpoint with validation.
    
    Addresses requirements:
    - Document Processing: API endpoint for document uploads
    - Security: File validation and access control
    """
    document = await controller.handle_upload(file, application_id, user_id)
    
    return DocumentResponse(
        document_id=document.id,
        application_id=document.application_id,
        document_type=document.document_type,
        processing_status=document.processing_status,
        confidence_score=document.metadata.get('classification', {}).get('confidence'),
        processing_time=document.metadata.get('processing_time'),
        metadata=document.metadata
    )

@router.get('/{document_id}', response_model=DocumentResponse)
@validate_document_access
async def get_document(document_id: str) -> DocumentResponse:
    """Retrieve document metadata and processing status.
    
    Addresses requirements:
    - Document Processing: Status monitoring and result retrieval
    """
    try:
        # Retrieve document from database
        document = await Document.get_by_id(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
            
        return DocumentResponse(
            document_id=document.id,
            application_id=document.application_id,
            document_type=document.document_type,
            processing_status=document.processing_status,
            confidence_score=document.metadata.get('classification', {}).get('confidence'),
            processing_time=document.metadata.get('processing_time'),
            metadata=document.metadata
        )
        
    except Exception as e:
        logger.error(f"Error retrieving document {document_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving document: {str(e)}"
        )

@background_task
@handle_processing_errors
async def _process_document(document: Document) -> None:
    """Background task for document classification and OCR processing.
    
    Addresses requirements:
    - Document Processing: Asynchronous processing pipeline
    - Processing Time: Efficient background processing
    """
    try:
        start_time = datetime.utcnow()
        
        # Update status to processing
        document.update_processing_status('PROCESSING', {
            'started_at': start_time.isoformat()
        })
        
        # Perform document classification
        doc_type, confidence = await controller.classifier.classify_document(document)
        
        # Run OCR processing if needed
        if confidence >= 0.85:  # High confidence threshold
            ocr_results = await controller.ocr_processor.process_document(document)
            extracted_fields = await controller.ocr_processor.extract_fields(
                doc_type, 
                ocr_results
            )
            
            # Update document with results
            document.store_ocr_result(ocr_results)
            document.metadata['extracted_fields'] = extracted_fields
        
        # Calculate processing time
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        # Update final status
        document.update_processing_status('COMPLETED', {
            'processing_time': processing_time,
            'completed_at': datetime.utcnow().isoformat()
        })
        
        logger.info(
            f"Document processing completed successfully",
            extra={
                'document_id': document.id,
                'processing_time': processing_time,
                'confidence': confidence
            }
        )
        
    except Exception as e:
        logger.error(f"Document processing failed: {str(e)}")
        document.update_processing_status('FAILED', {
            'error': str(e),
            'error_type': type(e).__name__
        })
        raise