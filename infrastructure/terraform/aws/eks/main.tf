# Human Tasks:
# 1. Verify AWS credentials have necessary permissions for EKS cluster creation
# 2. Review node group instance types and sizing for workload requirements
# 3. Ensure KMS key permissions are configured for cluster encryption
# 4. Validate network CIDR ranges for pod and service networks

# Required Provider Configuration
# REQ: Container Orchestration (4.5 Deployment Architecture)
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws" # version ~> 4.0
      version = "~> 4.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes" # version ~> 2.0
      version = "~> 2.0"
    }
  }
  required_version = ">= 1.0"
}

# Local variables for resource naming and tagging
locals {
  cluster_name = "${var.project_name}-${var.environment}-eks"
  tags = {
    Environment = var.environment
    Project     = "MCA Processing"
    ManagedBy   = "Terraform"
  }
}

# REQ: Container Orchestration (4.5 Deployment Architecture)
# REQ: High Availability Infrastructure (8.1 Deployment Environment)
# REQ: Security Architecture (7.2 Data Security)
module "eks" {
  source = "../../modules/eks"

  cluster_name    = local.cluster_name
  cluster_version = "1.27"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  
  # Security configuration
  enable_encryption               = var.enable_encryption
  cluster_endpoint_private_access = true
  cluster_endpoint_public_access  = false
  
  # Enable comprehensive logging
  cluster_log_types = [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler"
  ]

  # Node group configuration for high availability
  node_groups = {
    application = {
      instance_types = ["m6i.2xlarge"]
      scaling_config = {
        desired_size = 3
        min_size     = 3
        max_size     = 10
      }
      labels = {
        role = "application"
      }
    }
  }

  tags = local.tags
}

# Output values for use by other modules
output "cluster_name" {
  description = "Name of the EKS cluster"
  value       = module.eks.cluster_id
}

output "cluster_endpoint" {
  description = "Endpoint URL for the EKS cluster API server"
  value       = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data for the EKS cluster"
  value       = module.eks.cluster_certificate_authority_data
}

output "cluster_security_group_id" {
  description = "Security group ID for the EKS cluster"
  value       = module.eks.cluster_id
}