# Human Tasks:
# 1. Verify AWS KMS key configuration for server-side encryption
# 2. Confirm bucket naming convention compliance with organization standards
# 3. Review replication IAM roles and permissions
# 4. Validate retention policy compliance with legal requirements

# REQ: Document Storage (4.2.2 Data Storage Components)
# S3 bucket name with DNS compatibility validation
variable "bucket_name" {
  description = "Name of the S3 bucket for MCA document storage. Must be globally unique and DNS-compatible."
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9.-]{3,63}$", var.bucket_name))
    error_message = "Bucket name must be between 3 and 63 characters, and can only contain lowercase letters, numbers, dots, and hyphens"
  }
}

# REQ: Data Security (7.2.1 Encryption Standards)
# Versioning configuration for document history and compliance
variable "enable_versioning" {
  description = "Enable versioning for document history tracking and compliance requirements"
  type        = bool
  default     = true
  validation {
    condition     = var.enable_versioning == true
    error_message = "Versioning must be enabled for compliance requirements"
  }
}

# REQ: Data Security (7.2.1 Encryption Standards)
# Server-side encryption configuration
variable "enable_encryption" {
  description = "Enable AES-256 server-side encryption for documents at rest"
  type        = bool
  default     = true
  validation {
    condition     = var.enable_encryption == true
    error_message = "Encryption must be enabled for security compliance"
  }
}

# REQ: Data Retention (5.2.2 Data Management)
# Document retention configuration for regulatory compliance
variable "retention_period" {
  description = "Document retention period in days. Minimum 2555 days (7 years) required for financial regulatory compliance"
  type        = number
  default     = 2555
  validation {
    condition     = var.retention_period >= 2555
    error_message = "Retention period must be at least 2555 days (7 years) for regulatory compliance"
  }
}

# REQ: Document Storage (4.2.2 Data Storage Components)
# Cross-region replication configuration for disaster recovery
variable "enable_replication" {
  description = "Enable cross-region replication for disaster recovery and high availability"
  type        = bool
  default     = true
  validation {
    condition     = var.enable_replication == true
    error_message = "Cross-region replication must be enabled for disaster recovery requirements"
  }
}

# REQ: Document Storage (4.2.2 Data Storage Components)
# Replication region configuration for geographic redundancy
variable "replication_region" {
  description = "AWS region for bucket replication. Must be us-west-2 for geographic redundancy"
  type        = string
  default     = "us-west-2"
  validation {
    condition     = var.replication_region == "us-west-2"
    error_message = "Replication region must be us-west-2 for geographic redundancy requirements"
  }
}

# REQ: Document Storage (4.2.2 Data Storage Components)
# Resource tagging configuration
variable "tags" {
  description = "Tags to be applied to the S3 bucket. Must include Environment and Project tags."
  type        = map(string)
  default     = {}
  validation {
    condition     = can(lookup(var.tags, "Environment", null)) && can(lookup(var.tags, "Project", null))
    error_message = "Tags must include at minimum 'Environment' and 'Project' keys"
  }
}