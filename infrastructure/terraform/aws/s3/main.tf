# Human Tasks:
# 1. Verify AWS credentials and permissions for cross-region replication
# 2. Ensure KMS keys are properly configured in both primary and replica regions
# 3. Validate bucket naming convention compliance with organization standards
# 4. Review retention policies match compliance requirements

# REQ: Document Storage (4.2.2 Data Storage Components)
# Configure Terraform and required providers
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Import required variables from common configuration
locals {
  bucket_name = "${var.project_name}-${var.environment}"
}

# REQ: Document Storage (4.2.2 Data Storage Components)
# REQ: Data Security (7.2.1 Encryption Standards)
# REQ: Data Retention (5.2.2 Data Management)
# Configure S3 bucket using the s3_module with required security and compliance features
module "s3_module" {
  source = "../../modules/s3"

  bucket_name        = local.bucket_name
  enable_versioning  = true
  enable_encryption  = true
  retention_period   = 2555  # 7 years in days for financial regulatory compliance
  enable_replication = true
  replication_region = "us-west-2"
  tags              = var.tags
}

# Export bucket information for other resources
output "document_bucket_id" {
  description = "ID of the created S3 bucket for document storage"
  value       = module.s3_module.bucket_id
}

output "document_bucket_arn" {
  description = "ARN of the created S3 bucket for IAM policies"
  value       = module.s3_module.bucket_arn
}

output "document_bucket_domain" {
  description = "Domain name of the S3 bucket for application configuration"
  value       = module.s3_module.bucket_domain_name
}