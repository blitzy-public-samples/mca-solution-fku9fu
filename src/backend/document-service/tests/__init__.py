# Standard library imports - Python 3.11
import os

# Third-party imports
import pytest  # version: 7.4.0

# Internal imports
from ..src.utils.logger import get_logger
from ..src.config.settings import Config

# Human Tasks:
# 1. Create test environment configuration file (.env.test)
# 2. Configure test AWS credentials with appropriate permissions
# 3. Set up test S3 bucket for integration tests
# 4. Configure test KMS key for encryption testing

# Global constants and configurations
TEST_ENV = 'test'

# Initialize test logger with debug level for detailed test output
logger = get_logger(__name__, log_level='DEBUG')

def setup_test_environment():
    """Configures the test environment with appropriate settings and logging,
    ensuring proper test isolation and configuration.
    
    Addresses requirements:
    - System Availability: Ensures 99.9% uptime through comprehensive testing
      with standardized test environment configuration and logging
    - Document Processing: Test configuration for document classification,
      OCR processing, and data extraction validation
    
    Returns:
        None: Test environment configured with validated settings and logging
    """
    # Set test environment variable to ensure proper isolation
    os.environ['ENV'] = TEST_ENV
    
    try:
        # Load test-specific environment variables
        Config.load_environment_variables()
        
        # Initialize test configuration
        test_config = Config()
        
        # Validate test environment configuration
        test_config.validate_settings()
        
        logger.info(
            "Test environment configured successfully",
            extra={
                "environment": TEST_ENV,
                "config_validated": True,
                "log_level": "DEBUG"
            }
        )
        
    except Exception as e:
        logger.error(
            "Failed to configure test environment",
            extra={
                "error": str(e),
                "environment": TEST_ENV
            }
        )
        raise