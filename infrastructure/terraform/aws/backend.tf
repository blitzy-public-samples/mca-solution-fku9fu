# Human Tasks:
# 1. Replace ACCOUNT_ID in the KMS key ARN with your actual AWS account ID
# 2. Ensure the S3 bucket 'mca-processing-terraform-state' is created before applying this configuration
# 3. Verify DynamoDB table 'mca-processing-terraform-locks' exists with proper capacity
# 4. Confirm IAM permissions for accessing S3, DynamoDB, and KMS resources

# Required Provider Configuration
# REQ: Infrastructure State Management (8.1 DEPLOYMENT ENVIRONMENT)
terraform {
  required_version = ">= 1.5.0"
  
  # REQ: Security Compliance (7.2 DATA SECURITY)
  # REQ: High Availability (8.1 DEPLOYMENT ENVIRONMENT)
  backend "s3" {
    # Primary state storage bucket
    bucket = "mca-processing-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = var.aws_primary_region
    
    # Enable encryption at rest using AWS KMS
    encrypt    = true
    kms_key_id = "arn:aws:kms:us-east-1:ACCOUNT_ID:key/terraform-bucket-key"
    
    # Enable versioning for state file history
    versioning = true
    acl        = "private"
    
    # Environment-specific workspace prefixing
    workspace_key_prefix = "env"
    
    # DynamoDB table for state locking
    dynamodb_table = "mca-processing-terraform-locks"
    
    # Additional S3 configuration for high availability
    force_path_style = false
    
    # Enable server-side encryption with AES-256
    server_side_encryption_configuration {
      rule {
        apply_server_side_encryption_by_default {
          sse_algorithm = "aws:kms"
        }
      }
    }
    
    # Enable cross-region replication for high availability
    replication_configuration {
      role = "arn:aws:iam::ACCOUNT_ID:role/terraform-state-replication-role"
      rules {
        id     = "cross-region-replication"
        status = "Enabled"
        
        destination {
          bucket = "arn:aws:s3:::mca-processing-terraform-state-replica"
          replica_kms_key_id = "arn:aws:kms:us-west-2:ACCOUNT_ID:key/terraform-bucket-key-replica"
        }
      }
    }
  }
}

# Provider version constraints
# AWS Provider v5.0 or higher required for advanced security features
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}