# Human Tasks:
# 1. Verify IAM role permissions for cross-region replication
# 2. Confirm KMS key configuration in replication region
# 3. Validate bucket naming convention compliance with organization standards
# 4. Review lifecycle rules against retention requirements

# AWS Provider configuration
# Version: ~> 4.0
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# REQ: Document Storage (4.2.2 Data Storage Components)
# Primary S3 bucket for MCA document storage
resource "aws_s3_bucket" "main" {
  bucket        = var.bucket_name
  force_destroy = false
  tags          = var.tags
}

# REQ: Data Security (7.2.1 Encryption Standards)
# Enable versioning for document history tracking
resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = "Enabled"
  }
}

# REQ: Data Security (7.2.1 Encryption Standards)
# Configure server-side encryption with AES-256
resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# REQ: Data Retention (5.2.2 Data Management)
# Configure lifecycle rules for 7-year retention
resource "aws_s3_bucket_lifecycle_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    id     = "document_retention"
    status = "Enabled"

    expiration {
      days = var.retention_period
    }

    noncurrent_version_expiration {
      noncurrent_days = var.retention_period
    }
  }
}

# REQ: Document Storage (4.2.2 Data Storage Components)
# Configure cross-region replication for disaster recovery
resource "aws_s3_bucket_replication_configuration" "main" {
  count = var.enable_replication ? 1 : 0

  depends_on = [aws_s3_bucket_versioning.main]

  role   = aws_iam_role.replication[0].arn
  bucket = aws_s3_bucket.main.id

  rule {
    id     = "disaster_recovery"
    status = "Enabled"

    destination {
      bucket        = aws_s3_bucket.replica[0].arn
      storage_class = "STANDARD"

      encryption_configuration {
        replica_kms_key_id = aws_kms_key.replica[0].arn
      }
    }

    source_selection_criteria {
      sse {
        status = "Enabled"
      }
    }
  }
}

# Replica bucket in secondary region for disaster recovery
resource "aws_s3_bucket" "replica" {
  count = var.enable_replication ? 1 : 0

  provider = aws.replica
  bucket   = "${var.bucket_name}-replica"
  tags     = merge(var.tags, { "Replica" = "true" })
}

# KMS key for replica bucket encryption
resource "aws_kms_key" "replica" {
  count = var.enable_replication ? 1 : 0

  provider                = aws.replica
  description            = "KMS key for S3 bucket replication encryption"
  deletion_window_in_days = 7
  enable_key_rotation    = true
  tags                   = var.tags
}

# IAM role for S3 replication
resource "aws_iam_role" "replication" {
  count = var.enable_replication ? 1 : 0

  name = "s3-bucket-replication-${var.bucket_name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for S3 replication
resource "aws_iam_role_policy" "replication" {
  count = var.enable_replication ? 1 : 0

  name = "s3-bucket-replication-policy-${var.bucket_name}"
  role = aws_iam_role.replication[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetReplicationConfiguration",
          "s3:ListBucket"
        ]
        Effect = "Allow"
        Resource = [
          aws_s3_bucket.main.arn
        ]
      },
      {
        Action = [
          "s3:GetObjectVersionForReplication",
          "s3:GetObjectVersionAcl",
          "s3:GetObjectVersionTagging"
        ]
        Effect = "Allow"
        Resource = [
          "${aws_s3_bucket.main.arn}/*"
        ]
      },
      {
        Action = [
          "s3:ReplicateObject",
          "s3:ReplicateDelete",
          "s3:ReplicateTags"
        ]
        Effect = "Allow"
        Resource = [
          "${aws_s3_bucket.replica[0].arn}/*"
        ]
      },
      {
        Action = [
          "kms:Decrypt"
        ]
        Effect = "Allow"
        Resource = [
          aws_kms_key.replica[0].arn
        ]
      }
    ]
  })
}

# Export bucket identifiers for resource references
output "bucket_id" {
  description = "The name of the bucket"
  value       = aws_s3_bucket.main.id
}

output "bucket_arn" {
  description = "The ARN of the bucket"
  value       = aws_s3_bucket.main.arn
}

output "bucket_domain_name" {
  description = "The bucket domain name"
  value       = aws_s3_bucket.main.bucket_domain_name
}