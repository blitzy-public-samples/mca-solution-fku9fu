# setuptools v67.8.0
# wheel v0.40.0
import os
from setuptools import setup, find_packages

# Human Tasks Required:
# 1. Ensure Tesseract OCR is installed on the system (required for pytesseract)
# 2. Verify system has Python 3.11+ installed
# 3. Configure AWS credentials for boto3 access
# 4. Install system dependencies for pdf2image (poppler-utils)

# Read the README file for long description
with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

# Read requirements from requirements.txt
with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    # Package metadata
    name="document-service",  # REQ: Technology Stack - Python service implementation
    version="1.0.0",
    description="Document processing service for MCA application handling with OCR and classification capabilities, providing ≥99% accuracy and <5 minutes processing time",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Dollar Funding",
    author_email="tech@dollarfunding.com",
    
    # Package configuration
    python_requires=">=3.11",  # REQ: Technology Stack - Python 3.11 requirement
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    
    # Dependencies
    install_requires=requirements,  # REQ: Document Processing - Core dependencies for OCR and classification
    extras_require={
        "dev": [
            "black==23.3.0",
            "pylint==2.17.4",
            "pytest==7.4.0",
            "pytest-cov==4.1.0"
        ]
    },
    
    # Entry points
    entry_points={
        "console_scripts": [
            "document-service=src.main:app"  # REQ: Backend Framework - FastAPI application entry point
        ]
    },
    
    # Package data and resources
    include_package_data=True,
    package_data={
        "document_service": [
            "static/*",
            "templates/*",
            "models/*.pkl",
            "config/*.json"
        ]
    },
    zip_safe=False,  # Required for proper resource handling
    
    # Project URLs and classifiers
    url="https://github.com/dollarfunding/document-service",
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Financial and Insurance Industry",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3.11",
        "Topic :: Office/Business :: Financial",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Scientific/Engineering :: Image Recognition",
    ],
    
    # Platform and environment markers
    platforms=["any"],
    python_requires=">=3.11",
    
    # Additional metadata
    keywords="ocr, document-processing, machine-learning, fastapi, mca",
    license="MIT",
    
    # Build configuration
    setup_requires=[
        "wheel==0.40.0",
        "setuptools==67.8.0"
    ]
)