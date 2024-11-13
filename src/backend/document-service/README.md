# Document Service

Enterprise-grade document classification and OCR processing service for the MCA Application Processing System.

> Addresses requirements:
> - Document Processing: Document classification, OCR processing, and data extraction capabilities
> - Accuracy: ≥ 99% accuracy in data extraction
> - Processing Time: < 5 minutes per application processing time

## Overview

The Document Service is a critical component of the MCA Application Processing System, providing intelligent document classification and high-accuracy OCR processing capabilities. It leverages machine learning for document type identification and Tesseract OCR for text extraction, ensuring ≥99% accuracy in data extraction while maintaining processing times under 5 minutes per application.

Key Features:
- Intelligent document classification with 0.85 confidence threshold
- High-accuracy OCR processing (≥99%)
- Support for multiple document types (PDF, PNG, JPEG, TIFF)
- Real-time processing with performance monitoring
- Secure document handling and data extraction

## Installation

### Prerequisites

- Python 3.11
- Tesseract OCR Engine (v4.1.1 or higher)
- System Dependencies:
  ```bash
  # Ubuntu/Debian
  sudo apt-get update
  sudo apt-get install -y tesseract-ocr libtesseract-dev python3-dev

  # CentOS/RHEL
  sudo yum install -y tesseract tesseract-devel python3-devel
  ```

### Python Dependencies

```bash
pip install -r requirements.txt
```

Required packages:
- pytesseract==0.3.10
- scikit-learn==1.2.0
- numpy==1.24.0
- Pillow==9.5.0
- pdf2image==1.16.3

## Configuration

### Environment Variables

```bash
# OCR Configuration
TESSERACT_PATH=/usr/bin/tesseract
OCR_LANGUAGE=eng
OCR_DPI=300
OCR_PSM=3
OCR_OEM=3

# Classification Configuration
CONFIDENCE_THRESHOLD=0.85
MODEL_PATH=/path/to/models
FEATURE_EXTRACTION_MAX_FEATURES=5000

# Storage Configuration
S3_BUCKET=mca-documents
S3_REGION=us-east-1
```

### Tesseract Configuration

1. Install language data files:
```bash
sudo apt-get install tesseract-ocr-eng
```

2. Verify installation:
```bash
tesseract --version
```

### Model Configuration

Classification model parameters:
```python
{
    'max_features': 5000,
    'ngram_range': (1, 2),
    'confidence_threshold': 0.85
}
```

## Usage

### Document Classification

```python
from services.classification_service import DocumentClassifier
from config.settings import Config

# Initialize classifier
classifier = DocumentClassifier(Config())

# Classify document
document_type, confidence = classifier.classify_document(document)
```

### OCR Processing

```python
from services.ocr_service import OCRProcessor
from config.settings import Config

# Initialize OCR processor
processor = OCRProcessor(Config())

# Process document
results = processor.process_document(document, content)
```

### API Endpoints

```bash
# Classify document
POST /api/v1/documents/classify
Content-Type: multipart/form-data
{
    "file": <document_file>
}

# Process document with OCR
POST /api/v1/documents/process
Content-Type: multipart/form-data
{
    "file": <document_file>,
    "type": "application_form"
}
```

## Development

### Setup Development Environment

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. Install development dependencies:
```bash
pip install -r requirements-dev.txt
```

### Testing

Run tests with coverage:
```bash
pytest --cov=src tests/
```

Test accuracy validation:
```bash
python -m scripts.validate_accuracy --test-set /path/to/test/data
```

### Model Training

1. Prepare training data:
```bash
python -m scripts.prepare_training_data --input-dir /path/to/documents
```

2. Train classification model:
```bash
python -m scripts.train_classifier --data-dir /path/to/prepared/data
```

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t document-service:latest .

# Run container
docker run -d \
    --name document-service \
    -p 8080:8080 \
    -v /path/to/models:/app/models \
    -e TESSERACT_PATH=/usr/bin/tesseract \
    document-service:latest
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: document-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: document-service
        image: document-service:latest
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "2"
```

### Performance Considerations

- Configure resource limits based on document size and processing load
- Enable GPU acceleration for OCR processing when available
- Implement caching for frequently accessed documents
- Monitor processing times to maintain <5 minute SLA
- Scale horizontally based on queue length and processing metrics

### Monitoring

Key metrics to monitor:
- Classification accuracy and confidence scores
- OCR processing time per document
- Error rates and types
- Queue length and processing backlog
- Resource utilization (CPU, memory, GPU)

### Security

- Document encryption at rest using AES-256
- Access control through JWT authentication
- Input validation and sanitization
- Secure temporary file handling
- Regular security scans and updates