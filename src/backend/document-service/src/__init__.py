# Standard library imports - Python 3.11
import os
from typing import Optional

# Internal imports
from .utils.logger import get_logger
from .config.settings import Config

# Human Tasks:
# 1. Ensure environment-specific .env files are properly configured before deployment
# 2. Verify AWS credentials and permissions are set up in each environment
# 3. Configure monitoring system to track service initialization status
# 4. Set up log aggregation for initialization-related logs
# 5. Ensure Tesseract OCR is installed in all deployment environments

# Service version for deployment tracking and monitoring
__version__ = '1.0.0'

# Initialize global logger instance for service-wide logging
logger = get_logger(__name__)

# Global configuration instance
config: Optional[Config] = None

def initialize_service() -> Config:
    """Initializes the document service with environment-aware configuration and logging setup.
    
    Addresses requirements:
    - Document Processing: Ensures proper initialization of document processing components
    - System Availability: Establishes standardized logging and configuration
    
    Returns:
        Config: Initialized and validated service configuration instance
    
    Raises:
        ValueError: If configuration validation fails
        RuntimeError: If service initialization encounters critical errors
    """
    global config
    
    try:
        # Log initialization start with service version
        logger.info(
            "Initializing document service",
            extra={
                "version": __version__,
                "environment": os.getenv("ENV", "development")
            }
        )
        
        # Create configuration instance with environment-specific settings
        config = Config()
        
        # Validate all configuration settings including AWS connectivity
        logger.info("Validating service configuration")
        config.validate_settings()
        
        # Initialize S3 client with retry handling
        logger.info("Establishing S3 connection")
        s3_client = config.get_s3_client()
        
        # Log successful initialization
        logger.info(
            "Document service initialized successfully",
            extra={
                "version": __version__,
                "environment": config.environment,
                "debug_mode": config.debug,
                "log_level": config.log_level
            }
        )
        
        return config
        
    except ValueError as ve:
        logger.error(
            "Configuration validation failed during service initialization",
            extra={"error": str(ve)}
        )
        raise
        
    except Exception as e:
        logger.error(
            "Critical error during service initialization",
            extra={
                "error": str(e),
                "error_type": type(e).__name__
            }
        )
        raise RuntimeError(f"Service initialization failed: {str(e)}") from e