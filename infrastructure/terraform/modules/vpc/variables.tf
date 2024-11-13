# Human Tasks:
# 1. Ensure AWS provider is configured with appropriate permissions for VPC creation
# 2. Verify that the AWS region supports all specified availability zones
# 3. Review CIDR blocks to ensure they don't conflict with existing networks
# 4. Confirm compliance with organization's IP addressing scheme

# Terraform AWS Provider version >= 4.0.0 required for VPC features

# REQ: Network Security Architecture (7.3.1 Network Security)
# Defines the prefix for all VPC resources to ensure consistent naming
variable "name_prefix" {
  description = "Prefix to be used for all VPC resource names"
  type        = string
  default     = "mca-processing"
}

# REQ: Production Environment Requirements (4.5 Deployment Architecture)
# Defines the environment type to enforce appropriate configurations
variable "environment" {
  description = "Environment for VPC (dev/staging/prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}

# REQ: Network Security Architecture (7.3.1 Network Security)
# Defines the main CIDR block for the VPC with validation
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR block"
  }
}

# REQ: High Availability Infrastructure (8.1 DEPLOYMENT ENVIRONMENT)
# Defines availability zones for multi-AZ deployment
variable "azs" {
  description = "List of availability zones for VPC subnets"
  type        = list(string)
  validation {
    condition     = length(var.azs) >= 2
    error_message = "At least 2 availability zones must be specified for high availability"
  }
}

# REQ: Network Security Architecture (7.3.1 Network Security)
# Defines public subnet CIDR blocks with validation
variable "public_subnets" {
  description = "List of CIDR blocks for public subnets (one per AZ)"
  type        = list(string)
  validation {
    condition     = length(var.public_subnets) == length(var.azs) && alltrue([for cidr in var.public_subnets : can(cidrhost(cidr, 0))])
    error_message = "Number of public subnets must match number of availability zones and each must be a valid CIDR block"
  }
}

# REQ: Network Security Architecture (7.3.1 Network Security)
# Defines private subnet CIDR blocks with validation
variable "private_subnets" {
  description = "List of CIDR blocks for private application subnets (one per AZ)"
  type        = list(string)
  validation {
    condition     = length(var.private_subnets) == length(var.azs) && alltrue([for cidr in var.private_subnets : can(cidrhost(cidr, 0))])
    error_message = "Number of private subnets must match number of availability zones and each must be a valid CIDR block"
  }
}

# REQ: Network Security Architecture (7.3.1 Network Security)
# Defines database subnet CIDR blocks with validation
variable "database_subnets" {
  description = "List of CIDR blocks for private database subnets (one per AZ)"
  type        = list(string)
  validation {
    condition     = length(var.database_subnets) == length(var.azs) && alltrue([for cidr in var.database_subnets : can(cidrhost(cidr, 0))])
    error_message = "Number of database subnets must match number of availability zones and each must be a valid CIDR block"
  }
}

# REQ: High Availability Infrastructure (8.1 DEPLOYMENT ENVIRONMENT)
# Controls NAT gateway deployment strategy with production safeguard
variable "single_nat_gateway" {
  description = "Use a single NAT gateway for cost savings in non-prod environments"
  type        = bool
  default     = false
  validation {
    condition     = var.environment == "prod" ? !var.single_nat_gateway : true
    error_message = "Production environment must use multiple NAT gateways for high availability"
  }
}

# REQ: Production Environment Requirements (4.5 Deployment Architecture)
# Enables DNS hostname support for VPC resources
variable "enable_dns_hostnames" {
  description = "Enable DNS hostnames in the VPC for service discovery"
  type        = bool
  default     = true
}

# REQ: Production Environment Requirements (4.5 Deployment Architecture)
# Enables DNS support for VPC
variable "enable_dns_support" {
  description = "Enable DNS support in the VPC for service discovery"
  type        = bool
  default     = true
}

# REQ: Production Environment Requirements (4.5 Deployment Architecture)
# Defines additional resource tags with validation
variable "tags" {
  description = "Additional tags for VPC resources (merged with default tags)"
  type        = map(string)
  default     = {}
  validation {
    condition     = can(lookup(var.tags, "Environment", null) == null)
    error_message = "The Environment tag is automatically set based on the environment variable"
  }
}