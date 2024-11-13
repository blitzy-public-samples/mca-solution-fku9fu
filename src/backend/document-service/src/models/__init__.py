"""Models package initializer for MCA application document processing.

Addresses requirements:
- Document Management: AI-powered classification and secure storage of application documents
- Document Processing: Document classification, OCR processing, Data extraction

This module provides centralized access to document management functionality by exposing
the Document model and related constants used throughout the document processing lifecycle.
"""

# Import document model and constants from document.py
from .document import (
    Document,
    DOCUMENT_TYPES,
    PROCESSING_STATUSES
)

# Define package exports
__all__ = [
    'Document',
    'DOCUMENT_TYPES',
    'PROCESSING_STATUSES'
]