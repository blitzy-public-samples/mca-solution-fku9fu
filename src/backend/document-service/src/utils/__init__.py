"""
Utility package initialization for Document Service.

This module initializes the utilities package and exposes common utility functions
for logging configuration and monitoring integration.

Requirements addressed:
- 4.4.1 Monitoring and Observability: Provides centralized logging configuration
  with structured JSON output
- 2. System Overview/Success Criteria: Supports uptime monitoring through
  comprehensive logging utilities
"""

# Import logging utilities from the logger module
# Note: Using relative import as per project structure
from .logger import get_logger

# Export the get_logger function for use across the service
__all__ = ['get_logger']