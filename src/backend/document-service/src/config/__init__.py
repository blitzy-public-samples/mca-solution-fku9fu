"""
Document Service Configuration Initialization Module

This module initializes and exports a singleton configuration instance with validated settings
for document processing, OCR, security, and AWS integration.

Addresses requirements:
- Document Processing: AI-powered classification and secure storage of application documents
- Data Extraction: Advanced OCR with support for handwritten text and imperfect scans
- Security Architecture: Security controls including encryption and authentication
"""

# Internal imports
from .settings import Config

# Initialize singleton configuration instance
# This creates a single Config instance that will be shared across the application
config = Config()

# Validate all configuration settings on initialization
# This ensures all required services and permissions are properly configured
config.validate_settings()

# Export configuration instance and its validated settings
__all__ = ['config']

# The following properties and methods are exposed for use by other modules:
# - APP_NAME: Application identifier
# - ENV: Current environment (development, staging, production)
# - DEBUG: Debug mode flag
# - LOGGING: Logging configuration
# - AWS_CONFIG: AWS service configuration
# - OCR_CONFIG: OCR processing settings
# - CLASSIFICATION_CONFIG: Document classification settings
# - SECURITY_CONFIG: Security and encryption settings
# - get_s3_client(): Method to obtain configured S3 client