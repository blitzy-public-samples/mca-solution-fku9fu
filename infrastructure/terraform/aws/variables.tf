# Human Tasks:
# 1. Verify AWS credentials and permissions are properly configured
# 2. Review and adjust VPC CIDR ranges if they conflict with existing networks
# 3. Ensure KMS keys are configured for encryption requirements
# 4. Validate tag values comply with organization standards

# REQ: Multi-Region Deployment (4.5 Deployment Architecture)
# Project name variable with validation for naming standards
variable "project_name" {
  description = "Name of the project used for resource naming"
  type        = string
  default     = "mca-processing"
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]*$", var.project_name))
    error_message = "Project name must start with a letter and contain only lowercase letters, numbers, and hyphens"
  }
}

# REQ: High Availability Infrastructure (8.1 DEPLOYMENT ENVIRONMENT)
# Environment variable to control deployment configuration
variable "environment" {
  description = "Deployment environment (dev/staging/prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}

# REQ: Multi-Region Deployment (4.5 Deployment Architecture)
# Primary region configuration with compliance requirements
variable "aws_primary_region" {
  description = "Primary AWS region for deployment"
  type        = string
  default     = "us-east-1"
  validation {
    condition     = var.aws_primary_region == "us-east-1"
    error_message = "Primary region must be us-east-1 for compliance and latency requirements"
  }
}

# REQ: High Availability Infrastructure (8.1 DEPLOYMENT ENVIRONMENT)
# Secondary region configuration for geographic redundancy
variable "aws_secondary_region" {
  description = "Secondary AWS region for high availability"
  type        = string
  default     = "us-west-2"
  validation {
    condition     = var.aws_secondary_region == "us-west-2"
    error_message = "Secondary region must be us-west-2 for geographic redundancy"
  }
}

# REQ: High Availability Infrastructure (8.1 DEPLOYMENT ENVIRONMENT)
# VPC CIDR configuration with validation
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR block"
  }
}

# REQ: Database Configuration (4.2.2 Data Storage Components)
# Encryption configuration for data security
variable "enable_encryption" {
  description = "Enable encryption for data at rest"
  type        = bool
  default     = true
  validation {
    condition     = var.enable_encryption == true
    error_message = "Encryption must be enabled for security compliance"
  }
}

# REQ: Database Configuration (4.2.2 Data Storage Components)
# Backup retention configuration for compliance
variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 35
  validation {
    condition     = var.backup_retention_days >= 35
    error_message = "Backup retention must be at least 35 days for compliance requirements"
  }
}

# REQ: Multi-Region Deployment (4.5 Deployment Architecture)
# Resource tagging configuration
variable "tags" {
  description = "Common tags to be applied to all resources"
  type        = map(string)
  default     = {}
  validation {
    condition     = can(lookup(var.tags, "Environment", null)) && can(lookup(var.tags, "Project", null))
    error_message = "Tags must include at minimum 'Environment' and 'Project' keys"
  }
}