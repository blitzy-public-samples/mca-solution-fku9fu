# Use Python 3.11 slim as base image for minimal footprint
# Addresses requirement: System Availability - Optimized base image for 99.9% uptime
FROM python:3.11-slim

# Set environment variables
# Prevents Python from writing pyc files and ensures logs are output immediately
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    APP_HOME=/app \
    PORT=8000 \
    # Tesseract configurations for OCR processing
    TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata \
    # Set non-interactive frontend for apt
    DEBIAN_FRONTEND=noninteractive

# Create non-root user for security
# Addresses requirement: System Availability - Secure container configuration
RUN groupadd -r docservice && \
    useradd -r -g docservice -s /bin/false -d ${APP_HOME} docservice

# Create and set working directory
WORKDIR ${APP_HOME}

# Install system dependencies and Tesseract OCR engine
# Addresses requirement: Document Processing - Tesseract OCR integration
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr=4.1.1-2.1 \
    libtesseract-dev=4.1.1-2.1 \
    tesseract-ocr-eng \
    poppler-utils \
    libmagic1 \
    # Additional dependencies for PDF processing
    ghostscript \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements file
COPY requirements.txt .

# Install Python packages
# Addresses requirement: Processing Time - Efficient dependency management
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and configuration
COPY . .

# Set proper permissions
# Addresses requirement: System Availability - Security configurations
RUN chown -R docservice:docservice ${APP_HOME} && \
    chmod -R 755 ${APP_HOME} && \
    # Create directory for temporary file processing
    mkdir -p ${APP_HOME}/tmp && \
    chown docservice:docservice ${APP_HOME}/tmp && \
    chmod 755 ${APP_HOME}/tmp

# Switch to non-root user
USER docservice

# Create health check endpoints directory
RUN mkdir -p ${APP_HOME}/src/health

# Expose port for FastAPI service
EXPOSE ${PORT}

# Set Python path
ENV PYTHONPATH=${APP_HOME}/src

# Health check configuration
# Addresses requirement: System Availability - Service monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health/live || exit 1

# Start FastAPI application with uvicorn
# Addresses requirements: 
# - System Availability - Production-ready server configuration
# - Processing Time - Optimized worker configuration
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", \
     "--workers", "4", "--log-level", "info", \
     "--proxy-headers", "--forwarded-allow-ips", "*"]