# Human Tasks:
# 1. Verify AWS KMS key permissions are properly configured for RDS encryption
# 2. Ensure database subnet groups are properly configured in the VPC
# 3. Review backup window timing for production workload patterns
# 4. Validate instance class sizing meets performance requirements

# REQ: High Availability Database (4.2.2 Data Storage Components)
# Configure AWS provider with required version
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"  # AWS Provider v5.0
      version = "~> 5.0"
    }
  }
}

# Define local variables for configuration
locals {
  db_name             = "mca_processing"
  engine_family       = "aurora-postgresql14"
  backup_window       = "03:00-04:00"
  maintenance_window  = "Mon:04:00-Mon:05:00"
}

# REQ: High Availability Database (4.2.2 Data Storage Components)
# REQ: Data Security (7.2 Data Security)
# REQ: Production Database (8.2 Cloud Services)
# Aurora PostgreSQL cluster module configuration
module "aurora_postgresql" {
  source = "../../modules/rds"

  # Environment configuration
  environment = var.environment

  # Network configuration
  vpc_id              = module.vpc.vpc_id
  database_subnet_ids = module.vpc.database_subnet_ids

  # Instance configuration
  instance_class = var.rds_instance_class
  engine_version = var.rds_engine_version
  instance_count = 3  # Primary + 2 replicas for high availability

  # Backup and maintenance configuration
  backup_retention_period      = var.backup_retention_days
  preferred_backup_window      = local.backup_window
  preferred_maintenance_window = local.maintenance_window

  # Database configuration
  database_name = local.db_name

  # Security configuration
  storage_encrypted = true

  # Monitoring configuration
  performance_insights_enabled = true
  monitoring_interval         = 60  # Enhanced monitoring interval in seconds

  # Protection configuration
  deletion_protection = true  # Prevent accidental deletion
}

# REQ: High Availability Database (4.2.2 Data Storage Components)
# Output the cluster endpoints for application configuration
output "cluster_endpoint" {
  description = "Aurora cluster writer endpoint"
  value       = module.aurora_postgresql.cluster_endpoint
}

output "reader_endpoint" {
  description = "Aurora cluster reader endpoint"
  value       = module.aurora_postgresql.reader_endpoint
}

output "cluster_identifier" {
  description = "Aurora cluster identifier"
  value       = module.aurora_postgresql.cluster_identifier
}