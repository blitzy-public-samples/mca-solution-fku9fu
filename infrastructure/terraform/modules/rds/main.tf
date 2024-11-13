# Human Tasks:
# 1. Ensure AWS KMS permissions are configured for key management
# 2. Verify database subnet group CIDR ranges for security compliance
# 3. Review security group ingress rules for production environment
# 4. Confirm master password is managed through AWS Secrets Manager

# AWS Provider version ~> 4.0 required for RDS features
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# REQ: Primary Database (6.3 DATABASES & STORAGE)
# Aurora PostgreSQL cluster configuration with encryption and high availability
resource "aws_rds_cluster" "main" {
  cluster_identifier           = var.cluster_identifier
  engine                      = "aurora-postgresql"
  engine_version              = var.engine_version
  database_name               = var.database_name
  master_username             = var.master_username
  backup_retention_period     = var.backup_retention_period
  preferred_backup_window     = var.preferred_backup_window
  preferred_maintenance_window = var.preferred_maintenance_window
  vpc_security_group_ids      = [aws_security_group.rds.id]
  db_subnet_group_name        = aws_db_subnet_group.main.name
  storage_encrypted           = true
  kms_key_id                  = aws_kms_key.rds.arn
  deletion_protection         = var.deletion_protection
  
  # REQ: High Availability (4.2.2 Data Storage Components)
  # Enable Multi-AZ deployment for high availability
  availability_zones = slice(data.aws_availability_zones.available.names, 0, var.replica_count + 1)
  
  # REQ: Data Security (7.2 DATA SECURITY)
  # Enable automated backups with encryption
  copy_tags_to_snapshot = true
  skip_final_snapshot   = false
  
  tags = var.tags
}

# REQ: High Availability (4.2.2 Data Storage Components)
# Aurora PostgreSQL cluster instances with monitoring
resource "aws_rds_cluster_instance" "main" {
  count                = var.replica_count + 1
  identifier           = "${var.cluster_identifier}-${count.index}"
  cluster_identifier   = aws_rds_cluster.main.id
  instance_class       = var.instance_class
  engine              = "aurora-postgresql"
  engine_version      = var.engine_version
  db_subnet_group_name = aws_db_subnet_group.main.name
  monitoring_interval  = var.monitoring_interval
  
  # Enable Performance Insights for enhanced monitoring
  performance_insights_enabled = true
  performance_insights_retention_period = 7
  
  tags = var.tags
}

# REQ: Data Security (7.2 DATA SECURITY)
# Database subnet group configuration
resource "aws_db_subnet_group" "main" {
  name        = "${var.cluster_identifier}-subnet-group"
  subnet_ids  = var.database_subnet_ids
  description = "Subnet group for ${var.cluster_identifier} Aurora cluster"
  
  tags = var.tags
}

# REQ: Data Security (7.2 DATA SECURITY)
# Security group for RDS access control
resource "aws_security_group" "rds" {
  name        = "${var.cluster_identifier}-sg"
  description = "Security group for ${var.cluster_identifier} Aurora cluster"
  vpc_id      = var.vpc_id

  # Allow PostgreSQL traffic from private subnets
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
    description = "Allow PostgreSQL access from private subnets"
  }

  # Allow outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = var.tags
}

# REQ: Data Security (7.2 DATA SECURITY)
# KMS key for database encryption
resource "aws_kms_key" "rds" {
  description             = "KMS key for RDS encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  
  # Enable automatic key rotation for enhanced security
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "*"
        }
        Action   = "kms:*"
        Resource = "*"
      }
    ]
  })
  
  tags = var.tags
}

# KMS key alias for easier reference
resource "aws_kms_alias" "rds" {
  name          = "alias/${var.cluster_identifier}-key"
  target_key_id = aws_kms_key.rds.key_id
}

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}