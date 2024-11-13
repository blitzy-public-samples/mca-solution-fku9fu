"""
Document Service Controllers Package

This module initializes the document service controllers package and exports the document 
controller router for FastAPI integration. It provides centralized access to document 
processing endpoints including upload, retrieval, processing and deletion operations.

Addresses requirements:
- Document Management: AI-powered classification and secure storage of application documents
- Document Processing: Document classification, OCR processing, Data extraction
- API Integration: RESTful API endpoints for document operations
"""

# Import the router and its endpoints from document_controller
from .document_controller import router

# Export the router with all document management endpoints
__all__ = ['router']