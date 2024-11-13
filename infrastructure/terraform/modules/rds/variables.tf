# Human Tasks:
# 1. Ensure AWS provider has permissions for RDS Aurora cluster creation and management
# 2. Verify KMS key permissions for database encryption
# 3. Review and configure master password in secure manner (e.g., using AWS Secrets Manager)
# 4. Confirm PostgreSQL 14.6 availability in target AWS region

# REQ: Database Infrastructure (4.2.2 Data Storage Components)
# Defines the cluster identifier for the Aurora PostgreSQL database
variable "cluster_identifier" {
  description = "Identifier for the RDS Aurora cluster"
  type        = string
  default     = "mca-processing-db"
}

# REQ: Database Infrastructure (4.2.2 Data Storage Components)
# Specifies the database engine with validation to ensure PostgreSQL
variable "engine" {
  description = "Database engine type"
  type        = string
  default     = "aurora-postgresql"
  validation {
    condition     = var.engine == "aurora-postgresql"
    error_message = "Only aurora-postgresql engine is supported"
  }
}

# REQ: Database Infrastructure (4.2.2 Data Storage Components)
# Enforces PostgreSQL 14.x version requirement
variable "engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "14.6"
  validation {
    condition     = can(regex("^14\\.", var.engine_version))
    error_message = "Engine version must be PostgreSQL 14.x"
  }
}

# REQ: High Availability Database (8.1 DEPLOYMENT ENVIRONMENT)
# Defines instance class with validation for r6g series
variable "instance_class" {
  description = "Instance class for database nodes"
  type        = string
  default     = "r6g.2xlarge"
  validation {
    condition     = can(regex("^r6g\\.", var.instance_class))
    error_message = "Instance class must be r6g series for optimal performance"
  }
}

# REQ: Database Infrastructure (4.2.2 Data Storage Components)
# Specifies the default database name
variable "database_name" {
  description = "Name of the default database to create"
  type        = string
  default     = "mca_processing"
}

# REQ: Data Security (7.2 DATA SECURITY)
# Defines master username with sensitive flag
variable "master_username" {
  description = "Master username for the database cluster"
  type        = string
  sensitive   = true
}

# REQ: Data Security (7.2 DATA SECURITY)
# Sets backup retention period with compliance requirement
variable "backup_retention_period" {
  description = "Number of days to retain automated backups"
  type        = number
  default     = 35
  validation {
    condition     = var.backup_retention_period >= 35
    error_message = "Backup retention period must be at least 35 days for compliance"
  }
}

# REQ: Database Infrastructure (4.2.2 Data Storage Components)
# Defines backup window with time format validation
variable "preferred_backup_window" {
  description = "Daily time range during which automated backups are created"
  type        = string
  default     = "03:00-04:00"
  validation {
    condition     = can(regex("^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$", var.preferred_backup_window))
    error_message = "Backup window must be in format HH:MM-HH:MM"
  }
}

# REQ: Database Infrastructure (4.2.2 Data Storage Components)
# Defines maintenance window with format validation
variable "preferred_maintenance_window" {
  description = "Weekly time range during which system maintenance can occur"
  type        = string
  default     = "sun:04:00-sun:05:00"
  validation {
    condition     = can(regex("^(mon|tue|wed|thu|fri|sat|sun):[0-2][0-9]:[0-5][0-9]-(mon|tue|wed|thu|fri|sat|sun):[0-2][0-9]:[0-5][0-9]$", var.preferred_maintenance_window))
    error_message = "Maintenance window must be in format ddd:HH:MM-ddd:HH:MM"
  }
}

# REQ: High Availability Database (8.1 DEPLOYMENT ENVIRONMENT)
# Enforces Multi-AZ deployment for high availability
variable "multi_az" {
  description = "Enable Multi-AZ deployment for high availability"
  type        = bool
  default     = true
  validation {
    condition     = var.multi_az == true
    error_message = "Multi-AZ deployment must be enabled for high availability"
  }
}

# REQ: Data Security (7.2 DATA SECURITY)
# Enforces storage encryption for security compliance
variable "storage_encrypted" {
  description = "Enable storage encryption"
  type        = bool
  default     = true
  validation {
    condition     = var.storage_encrypted == true
    error_message = "Storage encryption must be enabled for security compliance"
  }
}

# REQ: Database Infrastructure (4.2.2 Data Storage Components)
# Controls immediate application of changes
variable "apply_immediately" {
  description = "Apply changes immediately or during maintenance window"
  type        = bool
  default     = false
}

# REQ: High Availability Database (8.1 DEPLOYMENT ENVIRONMENT)
# Defines number of read replicas with minimum requirement
variable "replica_count" {
  description = "Number of read replicas to create"
  type        = number
  default     = 2
  validation {
    condition     = var.replica_count >= 1
    error_message = "At least one read replica is required for high availability"
  }
}

# REQ: Data Security (7.2 DATA SECURITY)
# Controls final snapshot behavior during destruction
variable "skip_final_snapshot" {
  description = "Skip final snapshot when destroying database"
  type        = bool
  default     = false
}

# REQ: Data Security (7.2 DATA SECURITY)
# Enforces deletion protection for production safety
variable "deletion_protection" {
  description = "Protect database from accidental deletion"
  type        = bool
  default     = true
  validation {
    condition     = var.deletion_protection == true
    error_message = "Deletion protection must be enabled for production databases"
  }
}

# REQ: Database Infrastructure (4.2.2 Data Storage Components)
# Defines enhanced monitoring interval with allowed values
variable "monitoring_interval" {
  description = "Enhanced monitoring interval in seconds"
  type        = number
  default     = 30
  validation {
    condition     = contains([0, 1, 5, 10, 15, 30, 60], var.monitoring_interval)
    error_message = "Monitoring interval must be one of: 0, 1, 5, 10, 15, 30, 60"
  }
}

# REQ: Database Infrastructure (4.2.2 Data Storage Components)
# Allows additional resource tagging
variable "tags" {
  description = "Additional tags for RDS resources"
  type        = map(string)
  default     = {}
}