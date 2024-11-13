# Human Tasks:
# 1. Verify AWS provider has necessary permissions for EKS cluster creation
# 2. Review node group instance types for cost optimization and workload requirements
# 3. Ensure KMS key permissions are configured if encryption is enabled
# 4. Validate network CIDR ranges for pod and service networks

# AWS Provider version 4.x
# REQ: Container Orchestration (4.4 Cross-Cutting Concerns)
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# Common tags for resource management and cost allocation
locals {
  common_tags = {
    Environment = var.environment
    Project     = "MCA-Processing-System"
    ManagedBy   = "Terraform"
  }
}

# REQ: Security Architecture (7.3.1 Network Security)
# KMS key for EKS secret encryption
resource "aws_kms_key" "eks" {
  count                   = var.enable_encryption ? 1 : 0
  description            = "KMS key for EKS cluster secret encryption"
  deletion_window_in_days = 7
  enable_key_rotation    = true
  tags                   = merge(local.common_tags, var.tags)
}

# REQ: Security Architecture (7.3.1 Network Security)
# IAM role for EKS cluster
resource "aws_iam_role" "eks_cluster" {
  name = "${var.cluster_name}-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(local.common_tags, var.tags)
}

# Attach required policies to EKS cluster role
resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.name
}

# REQ: Security Architecture (7.3.1 Network Security)
# IAM role for EKS node groups
resource "aws_iam_role" "eks_node" {
  name = "${var.cluster_name}-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(local.common_tags, var.tags)
}

# Attach required policies to node role
resource "aws_iam_role_policy_attachment" "eks_node_policies" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  ])

  policy_arn = each.value
  role       = aws_iam_role.eks_node.name
}

# REQ: Container Orchestration (4.4 Cross-Cutting Concerns)
# REQ: Production Environment (8.1 Deployment Environment)
# Main EKS cluster resource
resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  version  = var.cluster_version
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_private_access = var.cluster_endpoint_private_access
    endpoint_public_access  = var.cluster_endpoint_public_access
  }

  dynamic "encryption_config" {
    for_each = var.enable_encryption ? [1] : []
    content {
      provider {
        key_arn = aws_kms_key.eks[0].arn
      }
      resources = ["secrets"]
    }
  }

  enabled_cluster_log_types = var.cluster_log_types

  tags = merge(local.common_tags, var.tags)

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]
}

# REQ: Production Environment (8.1 Deployment Environment)
# EKS node groups for workload execution
resource "aws_eks_node_group" "main" {
  for_each = var.node_groups

  cluster_name    = aws_eks_cluster.main.name
  node_group_name = each.key
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = var.subnet_ids
  instance_types  = each.value.instance_types

  scaling_config {
    desired_size = each.value.scaling_config.desired_size
    min_size     = each.value.scaling_config.min_size
    max_size     = each.value.scaling_config.max_size
  }

  labels = each.value.labels

  tags = merge(local.common_tags, var.tags)

  depends_on = [
    aws_iam_role_policy_attachment.eks_node_policies
  ]
}

# Output values for use by other modules
output "cluster_id" {
  description = "ID of the created EKS cluster"
  value       = aws_eks_cluster.main.id
}

output "cluster_endpoint" {
  description = "Endpoint URL for the EKS cluster API server"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data for the EKS cluster"
  value       = aws_eks_cluster.main.certificate_authority[0].data
}

output "node_groups" {
  description = "Map of created EKS node groups"
  value       = aws_eks_node_group.main
}