# Standard library imports - Python 3.11
import os
from pathlib import Path

# Third-party imports
import boto3  # version: 1.26.0
from pydantic import BaseModel, Field, validator  # version: 2.0.0
from dotenv import load_dotenv  # version: 1.0.0

# Internal imports
from ..utils.logger import get_logger

# Human Tasks:
# 1. Create environment-specific .env files (.env.development, .env.staging, .env.production)
# 2. Configure AWS IAM roles and policies for S3 access
# 3. Install and configure Tesseract OCR on deployment environments
# 4. Set up KMS keys for field-level encryption in each environment
# 5. Configure monitoring system with provided thresholds

# Initialize logger
logger = get_logger(__name__, log_level='INFO')

# Default environment
DEFAULT_ENVIRONMENT = 'development'

def load_environment_variables():
    """Loads environment variables from .env file based on current environment.
    
    Addresses requirement: System Availability - Environment-specific configuration management
    """
    current_env = os.getenv('ENV', DEFAULT_ENVIRONMENT)
    env_file = Path(__file__).parent.parent.parent / f'.env.{current_env}'
    base_env = Path(__file__).parent.parent.parent / '.env'
    
    # Load base environment variables if exists
    if base_env.exists():
        load_dotenv(base_env)
    
    # Override with environment-specific variables
    if env_file.exists():
        load_dotenv(env_file, override=True)
    else:
        logger.warning(f"Environment file {env_file} not found, using base configuration")
    
    # Validate required variables
    required_vars = [
        'AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY',
        'S3_BUCKET', 'KMS_KEY_ID', 'API_BASE_URL'
    ]
    
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

class Config(BaseModel):
    """Configuration settings class using Pydantic for validation.
    
    Addresses requirements:
    - Document Processing: OCR and document handling configuration
    - Data Management: Secure storage settings
    - System Availability: Performance and monitoring settings
    """
    # Environment settings
    environment: str = Field(default_factory=lambda: os.getenv('ENV', DEFAULT_ENVIRONMENT))
    app_name: str = Field(default="document-service")
    log_level: str = Field(default_factory=lambda: os.getenv('LOG_LEVEL', 'INFO'))
    debug: bool = Field(default_factory=lambda: os.getenv('DEBUG', 'false').lower() == 'true')
    
    # AWS settings
    aws_region: str = Field(default_factory=lambda: os.getenv('AWS_REGION'))
    aws_access_key_id: str = Field(default_factory=lambda: os.getenv('AWS_ACCESS_KEY_ID'))
    aws_secret_access_key: str = Field(default_factory=lambda: os.getenv('AWS_SECRET_ACCESS_KEY'))
    s3_bucket: str = Field(default_factory=lambda: os.getenv('S3_BUCKET'))
    document_upload_path: str = Field(default="documents/{year}/{month}/{day}")
    
    # Document processing settings
    max_file_size_mb: int = Field(default=25)
    supported_file_types: list = Field(default=[
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/tiff'
    ])
    
    # OCR settings
    tesseract_path: str = Field(default_factory=lambda: os.getenv('TESSERACT_PATH', '/usr/bin/tesseract'))
    ocr_config: dict = Field(default={
        'language': 'eng',
        'dpi': 300,
        'psm': 3,  # Page segmentation mode
        'oem': 3,  # OCR Engine mode
        'timeout': 180,  # seconds
        'batch_size': 10
    })
    
    # API settings
    api_base_url: str = Field(default_factory=lambda: os.getenv('API_BASE_URL'))
    api_timeout_seconds: int = Field(default=30)
    max_retries: int = Field(default=3)
    use_ssl: bool = Field(default=True)
    
    # Security settings
    kms_key_id: str = Field(default_factory=lambda: os.getenv('KMS_KEY_ID'))
    
    # Monitoring settings
    monitoring_config: dict = Field(default={
        'metrics_enabled': True,
        'metrics_interval': 60,  # seconds
        'health_check_interval': 30,  # seconds
        'alert_thresholds': {
            'error_rate': 0.01,  # 1% error rate threshold
            'latency_ms': 1000,  # 1 second latency threshold
            'disk_usage': 0.85,  # 85% disk usage threshold
            'memory_usage': 0.80  # 80% memory usage threshold
        }
    })

    @validator('aws_region')
    def validate_aws_region(cls, v):
        """Validates AWS region format."""
        if not v.startswith('us-') and not v.startswith('eu-'):
            raise ValueError('Invalid AWS region format')
        return v

    @validator('max_file_size_mb')
    def validate_file_size(cls, v):
        """Validates maximum file size is within acceptable range."""
        if not 1 <= v <= 100:
            raise ValueError('File size must be between 1 and 100 MB')
        return v

    @validator('supported_file_types')
    def validate_file_types(cls, v):
        """Validates supported file types are properly formatted."""
        allowed_types = {'application/pdf', 'image/jpeg', 'image/png', 'image/tiff'}
        if not all(file_type in allowed_types for file_type in v):
            raise ValueError('Invalid file type in supported_file_types')
        return v

    def get_s3_client(self):
        """Creates and returns a configured S3 client instance with retry handling.
        
        Addresses requirement: Data Management - Secure document storage configuration
        
        Returns:
            boto3.client: Configured S3 client with retry and encryption settings
        """
        session = boto3.Session(
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key,
            region_name=self.aws_region
        )
        
        # Configure retry strategy
        config = boto3.Config(
            retries=dict(
                max_attempts=self.max_retries,
                mode='adaptive'
            ),
            connect_timeout=self.api_timeout_seconds,
            read_timeout=self.api_timeout_seconds
        )
        
        # Initialize S3 client with encryption
        client = session.client(
            's3',
            config=config,
            use_ssl=self.use_ssl
        )
        
        # Verify connection and permissions
        try:
            client.head_bucket(Bucket=self.s3_bucket)
        except Exception as e:
            logger.error(f"Failed to connect to S3 bucket: {str(e)}")
            raise
        
        return client

    def validate_settings(self) -> bool:
        """Validates all configuration settings with comprehensive checks.
        
        Addresses requirements:
        - Document Processing: OCR configuration validation
        - System Availability: Connectivity and permission checks
        
        Returns:
            bool: True if all settings are valid
        """
        try:
            # Validate OCR configuration
            if not Path(self.tesseract_path).exists():
                raise ValueError(f"Tesseract not found at {self.tesseract_path}")
            
            # Verify AWS credentials and permissions
            s3_client = self.get_s3_client()
            s3_client.head_bucket(Bucket=self.s3_bucket)
            
            # Validate KMS key
            kms_client = boto3.client(
                'kms',
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key,
                region_name=self.aws_region
            )
            kms_client.describe_key(KeyId=self.kms_key_id)
            
            # Validate API settings
            if not self.api_base_url.startswith(('http://', 'https://')):
                raise ValueError('Invalid API base URL format')
            
            # Validate monitoring settings
            if not all(k in self.monitoring_config['alert_thresholds'] 
                      for k in ['error_rate', 'latency_ms', 'disk_usage', 'memory_usage']):
                raise ValueError('Missing required monitoring thresholds')
            
            logger.info("All configuration settings validated successfully")
            return True
            
        except Exception as e:
            logger.error(f"Configuration validation failed: {str(e)}")
            raise