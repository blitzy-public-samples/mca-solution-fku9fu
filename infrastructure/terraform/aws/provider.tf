# Human Tasks:
# 1. Ensure AWS credentials are properly configured in ~/.aws/credentials or via environment variables
# 2. Verify IAM permissions for both regions include necessary service permissions
# 3. Confirm organization's tagging standards are met by the default tags

# REQ: Multi-Region Deployment (4.5 Deployment Architecture)
# REQ: High Availability (8.1 DEPLOYMENT ENVIRONMENT)
terraform {
  # Enforce minimum Terraform version for compatibility
  required_version = ">= 1.5.0"

  required_providers {
    # AWS Provider v5.0 or higher for latest features and security updates
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    
    # Random provider for resource naming and unique identifiers
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

# REQ: Multi-Region Deployment (4.5 Deployment Architecture)
# Primary region provider configuration (US-East-1)
provider "aws" {
  alias  = "primary"
  region = var.aws_primary_region

  # Mandatory tags for all resources in primary region
  default_tags {
    tags = {
      Environment = "production"
      Project     = "mca-processing"
      ManagedBy   = "terraform"
      Region      = "primary"
    }
  }
}

# REQ: High Availability (8.1 DEPLOYMENT ENVIRONMENT)
# Secondary region provider configuration (US-West-2)
provider "aws" {
  alias  = "secondary"
  region = var.aws_secondary_region

  # Mandatory tags for all resources in secondary region
  default_tags {
    tags = {
      Environment = "production"
      Project     = "mca-processing"
      ManagedBy   = "terraform"
      Region      = "secondary"
    }
  }
}