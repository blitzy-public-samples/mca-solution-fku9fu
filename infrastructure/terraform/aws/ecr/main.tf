# Human Tasks:
# 1. Verify KMS key permissions are properly configured for ECR encryption
# 2. Ensure IAM roles have necessary permissions for cross-account access
# 3. Review lifecycle policies align with organization's retention requirements
# 4. Validate ECR repository naming convention meets compliance standards

# Required provider configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws" # v5.0
      version = "~> 5.0"
    }
  }
}

# Import provider configurations from parent module
provider "aws" {
  alias = "primary"
}

provider "aws" {
  alias = "secondary"
}

# REQ: Container Registry (8.3 CONTAINERIZATION)
# Define local variables for repository configurations
locals {
  repositories = {
    email_service        = "${var.project_name}-email-service"
    document_service     = "${var.project_name}-document-service"
    core_service        = "${var.project_name}-core-service"
    notification_service = "${var.project_name}-notification-service"
    web_frontend        = "${var.project_name}-web-frontend"
  }
}

# REQ: Container Registry (8.3 CONTAINERIZATION)
# REQ: Security Requirements (7.2 Data Security)
# Create ECR repositories in primary region
resource "aws_ecr_repository" "repositories" {
  for_each = local.repositories
  provider = aws.primary

  name                 = each.value
  image_tag_mutability = "IMMUTABLE"

  # Enable container image scanning
  image_scanning_configuration {
    scan_on_push = true
  }

  # Configure KMS encryption for container images
  encryption_configuration {
    encryption_type = "KMS"
  }

  tags = {
    Service     = each.key
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# REQ: Container Registry (8.3 CONTAINERIZATION)
# Configure lifecycle policies for all repositories
resource "aws_ecr_lifecycle_policy" "lifecycle_policy" {
  for_each   = aws_ecr_repository.repositories
  provider   = aws.primary
  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 30 production images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["prod"]
          countType     = "imageCountMoreThan"
          countNumber   = 30
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Remove untagged images after 14 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 14
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# REQ: Multi-Region Deployment (8.1 DEPLOYMENT ENVIRONMENT)
# REQ: Security Requirements (7.2 Data Security)
# Configure repository policies for cross-account access
resource "aws_ecr_repository_policy" "cross_account_policy" {
  for_each   = aws_ecr_repository.repositories
  provider   = aws.primary
  repository = each.value.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCrossAccountPull"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${var.prod_account_id}:root"
        }
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ]
      }
    ]
  })
}

# REQ: Multi-Region Deployment (8.1 DEPLOYMENT ENVIRONMENT)
# Create ECR repositories in secondary region for redundancy
resource "aws_ecr_repository" "repositories_secondary" {
  for_each = local.repositories
  provider = aws.secondary

  name                 = each.value
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
  }

  tags = {
    Service     = each.key
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
    Region      = "secondary"
  }
}

# REQ: Container Registry (8.3 CONTAINERIZATION)
# Configure lifecycle policies for secondary region repositories
resource "aws_ecr_lifecycle_policy" "lifecycle_policy_secondary" {
  for_each   = aws_ecr_repository.repositories_secondary
  provider   = aws.secondary
  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 30 production images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["prod"]
          countType     = "imageCountMoreThan"
          countNumber   = 30
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Remove untagged images after 14 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 14
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# REQ: Multi-Region Deployment (8.1 DEPLOYMENT ENVIRONMENT)
# REQ: Security Requirements (7.2 Data Security)
# Configure repository policies for secondary region
resource "aws_ecr_repository_policy" "cross_account_policy_secondary" {
  for_each   = aws_ecr_repository.repositories_secondary
  provider   = aws.secondary
  repository = each.value.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCrossAccountPull"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${var.prod_account_id}:root"
        }
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ]
      }
    ]
  })
}