# Human Tasks:
# 1. Verify AWS credentials and permissions for VPC deployment
# 2. Review and validate CIDR ranges for subnet tiers
# 3. Ensure NAT Gateway service quotas are sufficient for multi-AZ deployment
# 4. Confirm availability zone selection matches regional requirements

# Required Provider and Terraform Configuration
# REQ: Production Environment (8.1 Deployment Environment)
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws" # version ~> 5.0
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.0"
}

# Configure AWS Provider with default tags
# REQ: Multi-Region Deployment (4.5 Deployment Architecture)
provider "aws" {
  region = var.aws_primary_region
  default_tags {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Create VPC using the VPC module
# REQ: High Availability Infrastructure (4.5 Deployment Architecture)
# REQ: Network Security (7.3.1 Network Security)
module "vpc" {
  source = "../../modules/vpc"

  name_prefix = var.project_name
  environment = var.environment
  vpc_cidr    = var.vpc_cidr

  # Configure multi-AZ deployment across three availability zones
  azs = [
    "${var.aws_primary_region}a",
    "${var.aws_primary_region}b",
    "${var.aws_primary_region}c"
  ]

  # Define subnet CIDR ranges for each tier
  public_subnets    = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnets   = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
  database_subnets  = ["10.0.21.0/24", "10.0.22.0/24", "10.0.23.0/24"]

  # Enable high availability features
  single_nat_gateway    = false
  enable_dns_hostnames  = true
  enable_dns_support    = true

  tags = var.tags
}

# Export VPC outputs for use by other modules
# REQ: Network Security (7.3.1 Network Security)
output "vpc_id" {
  description = "ID of the created VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = module.vpc.private_subnet_ids
}

output "database_subnet_ids" {
  description = "IDs of database subnets"
  value       = module.vpc.database_subnet_ids
}