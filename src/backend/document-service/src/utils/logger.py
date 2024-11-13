# Standard library imports - Python 3.11
import logging
import os
import json
from datetime import datetime

# Human Tasks:
# 1. Ensure LOG_LEVEL environment variable is set in deployment configuration
# 2. Configure log aggregation system to properly parse JSON formatted logs
# 3. Set up log rotation policies in production environment
# 4. Configure monitoring system alerts based on log levels and patterns

# Global constants for logging configuration
DEFAULT_LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
DEFAULT_LOG_LEVEL = 'INFO'
LOG_LEVELS = {
    'DEBUG': logging.DEBUG,
    'INFO': logging.INFO,
    'WARNING': logging.WARNING,
    'ERROR': logging.ERROR,
    'CRITICAL': logging.CRITICAL
}

class JsonFormatter(logging.Formatter):
    """Custom log formatter that outputs logs in JSON format for better parsing and integration
    with log aggregation systems.
    
    Addresses requirement: System Availability - Standardized formats for log aggregation and analysis
    """
    
    def __init__(self, reserved_attrs=None):
        super().__init__()
        # Default reserved attributes that should be included in every log message
        self.RESERVED_ATTRS = {
            'timestamp',
            'level',
            'logger',
            'message',
            'environment',
            'service',
            'trace_id'
        }
        # Add any additional reserved attributes
        if reserved_attrs:
            self.RESERVED_ATTRS.update(reserved_attrs)
    
    def format(self, record):
        """Formats the log record as a JSON string with consistent structure.
        
        Args:
            record (logging.LogRecord): The log record to format
            
        Returns:
            str: JSON formatted log string with standard fields
        """
        # Create base log object with standard fields
        log_object = {
            'timestamp': datetime.utcfromtimestamp(record.created).isoformat() + 'Z',
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'environment': os.getenv('ENVIRONMENT', 'development'),
            'service': 'document-service'
        }
        
        # Add exception info if present
        if record.exc_info:
            log_object['exception'] = {
                'type': record.exc_info[0].__name__,
                'message': str(record.exc_info[1]),
                'traceback': self.formatException(record.exc_info)
            }
        
        # Add any additional attributes from the record
        for attr, value in record.__dict__.items():
            if attr not in self.RESERVED_ATTRS and not attr.startswith('_'):
                log_object[attr] = value
        
        # Add trace ID if available for distributed tracing
        trace_id = getattr(record, 'trace_id', None)
        if trace_id:
            log_object['trace_id'] = trace_id
        
        # Ensure consistent ordering and formatting of JSON output
        return json.dumps(log_object, sort_keys=True, default=str)

def format_log_message(message, additional_context=None):
    """Formats log message with additional context in JSON format for structured logging.
    
    Args:
        message (dict): The main message to log
        additional_context (dict, optional): Additional context to include in the log
        
    Returns:
        str: JSON formatted log message with timestamp and environment info
    """
    log_data = {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'environment': os.getenv('ENVIRONMENT', 'development'),
        'service': 'document-service'
    }
    
    # Merge message with log data
    log_data.update(message)
    
    # Add additional context if provided
    if additional_context:
        log_data['context'] = additional_context
    
    return json.dumps(log_data, sort_keys=True, default=str)

def get_logger(name, log_level=None):
    """Creates and returns a configured logger instance for the specified module.
    
    Addresses requirements:
    - Document Processing: Comprehensive logging for document classification and processing
    - Monitoring and Observability: Integration with centralized logging systems
    
    Args:
        name (str): Name of the logger, typically __name__ of the module
        log_level (str, optional): Override default log level
        
    Returns:
        logging.Logger: Configured logger instance with JSON formatting
    """
    # Create logger instance
    logger = logging.getLogger(name)
    
    # Set log level from environment or parameter, fallback to default
    level = log_level or os.getenv('LOG_LEVEL', DEFAULT_LOG_LEVEL)
    logger.setLevel(LOG_LEVELS.get(level.upper(), LOG_LEVELS[DEFAULT_LOG_LEVEL]))
    
    # Prevent adding handlers if they already exist
    if not logger.handlers:
        # Create console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logger.level)
        
        # Create and set JSON formatter
        formatter = JsonFormatter()
        console_handler.setFormatter(formatter)
        
        # Add handler to logger
        logger.addHandler(console_handler)
    
    return logger