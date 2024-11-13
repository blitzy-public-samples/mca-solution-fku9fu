# Third-party imports
import pytest  # version: 7.3.1
from unittest.mock import MagicMock, patch  # version: python3.11
import numpy as np  # version: 1.24.0

# Internal imports
from ..src.services.classification_service import DocumentClassifier
from ..src.models.document import Document, DOCUMENT_TYPES

# Human Tasks:
# 1. Ensure test data files are available in test/fixtures directory
# 2. Configure test environment variables for S3 credentials
# 3. Set up test coverage monitoring
# 4. Validate test model and vectorizer files are in place

# Test data constants
TEST_DOCUMENTS = {
    'iso_application.pdf': b'test_content',
    'bank_statement.pdf': b'test_content'
}

MOCK_CONFIG = {
    'model_path': 'test/model.pkl',
    'vectorizer_path': 'test/vectorizer.pkl'
}

CONFIDENCE_THRESHOLD = 0.85

def setup_function():
    """Setup function run before each test.
    
    Addresses requirement: Document Classification - Test environment setup
    """
    # Reset mock objects and test state
    pytest.mock_s3 = MagicMock()
    pytest.mock_config = MagicMock()
    pytest.mock_config.get_s3_client.return_value = pytest.mock_s3
    pytest.mock_config.s3_bucket = 'test-bucket'

class TestDocumentClassifier:
    """Test class for document classification functionality.
    
    Addresses requirements:
    - Document Classification: Test document classification functionality
    - Accuracy: Validate ≥ 99% accuracy in data extraction and classification
    """

    def setup_method(self):
        """Setup method run before each test method."""
        self.mock_s3 = MagicMock()
        self.classifier = DocumentClassifier(pytest.mock_config)
        
        # Configure mock responses
        self.mock_s3.download_fileobj.return_value = None
        self.classifier.s3_client = self.mock_s3
        
        # Mock model predictions
        self.classifier.model = MagicMock()
        self.classifier.vectorizer = MagicMock()

    @pytest.mark.parametrize('doc_type,content', TEST_DOCUMENTS.items())
    def test_document_classification_accuracy(self, doc_type, content):
        """Tests the accuracy of document classification against the 99% requirement.
        
        Addresses requirement: Accuracy - Validate ≥ 99% accuracy in classification
        """
        # Setup test document
        document = Document(
            application_id="test-app-123",
            file_name=doc_type,
            file_type="pdf",
            mime_type="application/pdf",
            file_size=len(content),
            created_by="test-user"
        )
        
        # Mock text extraction
        self.classifier.extract_text = MagicMock(return_value="Test document content")
        
        # Configure model predictions with high confidence
        confidence_score = 0.99
        predicted_class_idx = DOCUMENT_TYPES.index('ISO_APPLICATION')
        prediction_probs = np.zeros((1, len(DOCUMENT_TYPES)))
        prediction_probs[0, predicted_class_idx] = confidence_score
        
        self.classifier.model.predict_proba.return_value = prediction_probs
        
        # Execute classification
        doc_type, confidence = self.classifier.classify_document(document)
        
        # Verify accuracy requirements
        assert confidence >= 0.99, "Classification confidence below 99% requirement"
        assert doc_type in DOCUMENT_TYPES, f"Invalid document type: {doc_type}"
        assert confidence > CONFIDENCE_THRESHOLD, "Confidence below threshold"
        
        # Verify document update
        assert document.document_type == doc_type
        assert document.classification_result == doc_type

    def test_invalid_document_handling(self):
        """Tests handling of invalid or corrupt documents.
        
        Addresses requirement: Document Classification - Error handling
        """
        # Setup test document with invalid content
        document = Document(
            application_id="test-app-456",
            file_name="corrupt.pdf",
            file_type="pdf",
            mime_type="application/pdf",
            file_size=0,
            created_by="test-user"
        )
        
        # Mock S3 error
        self.mock_s3.download_fileobj.side_effect = Exception("Failed to download")
        
        # Verify error handling
        with pytest.raises(Exception) as exc_info:
            self.classifier.classify_document(document)
        
        assert "Failed to download" in str(exc_info.value)
        assert document.processing_status == "PENDING"

    def test_confidence_threshold(self):
        """Tests confidence threshold for document classification.
        
        Addresses requirement: Document Classification - Confidence thresholds
        """
        document = Document(
            application_id="test-app-789",
            file_name="test.pdf",
            file_type="pdf",
            mime_type="application/pdf",
            file_size=100,
            created_by="test-user"
        )
        
        # Mock text extraction
        self.classifier.extract_text = MagicMock(return_value="Test content")
        
        # Test below threshold
        low_confidence = CONFIDENCE_THRESHOLD - 0.1
        prediction_probs = np.zeros((1, len(DOCUMENT_TYPES)))
        prediction_probs[0, 0] = low_confidence
        self.classifier.model.predict_proba.return_value = prediction_probs
        
        doc_type, confidence = self.classifier.classify_document(document)
        assert confidence < CONFIDENCE_THRESHOLD
        assert document.classification_result is None
        
        # Test above threshold
        high_confidence = CONFIDENCE_THRESHOLD + 0.1
        prediction_probs[0, 0] = high_confidence
        self.classifier.model.predict_proba.return_value = prediction_probs
        
        doc_type, confidence = self.classifier.classify_document(document)
        assert confidence > CONFIDENCE_THRESHOLD
        assert document.classification_result == DOCUMENT_TYPES[0]

    def test_text_extraction(self):
        """Tests document text extraction functionality.
        
        Addresses requirement: Document Classification - Text extraction
        """
        document = Document(
            application_id="test-app-101",
            file_name="test.pdf",
            file_type="pdf",
            mime_type="application/pdf",
            file_size=100,
            created_by="test-user"
        )
        
        # Mock S3 download
        self.mock_s3.download_fileobj.return_value = None
        
        # Mock PDF content
        with patch('PyPDF2.PdfReader') as mock_pdf:
            mock_page = MagicMock()
            mock_page.extract_text.return_value = "Test PDF content"
            mock_pdf.return_value.pages = [mock_page]
            
            extracted_text = self.classifier.extract_text(document)
            
            assert "Test PDF content" in extracted_text
            assert self.mock_s3.download_fileobj.called
            mock_page.extract_text.assert_called_once()