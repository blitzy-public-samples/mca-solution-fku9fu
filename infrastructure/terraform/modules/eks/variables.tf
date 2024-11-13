# Human Tasks:
# 1. Verify AWS provider has necessary permissions for EKS cluster creation
# 2. Review node group instance types for cost optimization and workload requirements
# 3. Ensure KMS key permissions are configured if encryption is enabled
# 4. Validate network CIDR ranges for pod and service networks

# REQ: Container Orchestration (4.5 Deployment Architecture)
# Defines the name of the EKS cluster with validation rules
variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  validation {
    condition     = length(var.cluster_name) <= 40 && can(regex("^[a-zA-Z][a-zA-Z0-9-]*$", var.cluster_name))
    error_message = "Cluster name must be 40 characters or less, start with a letter, and contain only alphanumeric characters and hyphens"
  }
}

# REQ: Container Orchestration (4.5 Deployment Architecture)
# Specifies the Kubernetes version for the EKS cluster
variable "cluster_version" {
  description = "Kubernetes version for the EKS cluster"
  type        = string
  default     = "1.27"
  validation {
    condition     = can(regex("^1\\.(2[6-7])$", var.cluster_version))
    error_message = "Supported Kubernetes versions are 1.26 and 1.27"
  }
}

# REQ: High Availability Infrastructure (8.1 Deployment Environment)
# References the VPC where the EKS cluster will be deployed
variable "vpc_id" {
  description = "ID of the VPC where EKS cluster will be deployed"
  type        = string
  validation {
    condition     = can(regex("^vpc-", var.vpc_id))
    error_message = "VPC ID must be a valid AWS VPC identifier"
  }
}

# REQ: High Availability Infrastructure (8.1 Deployment Environment)
# Defines subnet configuration for high availability
variable "subnet_ids" {
  description = "List of subnet IDs for EKS node groups"
  type        = list(string)
  validation {
    condition     = length(var.subnet_ids) >= 2 && alltrue([for s in var.subnet_ids : can(regex("^subnet-", s))])
    error_message = "At least 2 valid subnet IDs are required for high availability"
  }
}

# REQ: Container Orchestration (4.5 Deployment Architecture)
# Configures EKS node groups with instance types, scaling, and labels
variable "node_groups" {
  description = "Configuration for EKS node groups including instance types, scaling, and labels"
  type = map(object({
    instance_types = list(string)
    scaling_config = object({
      desired_size = number
      min_size     = number
      max_size     = number
    })
    labels = map(string)
  }))
  validation {
    condition     = alltrue([for ng in var.node_groups : ng.scaling_config.min_size <= ng.scaling_config.desired_size && ng.scaling_config.desired_size <= ng.scaling_config.max_size])
    error_message = "Node group scaling configuration must satisfy: min_size <= desired_size <= max_size"
  }
}

# REQ: Security Architecture (7.2 Data Security)
# Enables envelope encryption for EKS secrets
variable "enable_encryption" {
  description = "Enable envelope encryption for EKS secrets using KMS"
  type        = bool
  default     = true
}

# REQ: High Availability Infrastructure (8.1 Deployment Environment)
# Enables cluster autoscaling for dynamic workload management
variable "enable_cluster_autoscaler" {
  description = "Enable Kubernetes Cluster Autoscaler"
  type        = bool
  default     = true
}

# REQ: Security Architecture (7.2 Data Security)
# Controls private access to the EKS API server
variable "cluster_endpoint_private_access" {
  description = "Enable private API server endpoint"
  type        = bool
  default     = true
}

# REQ: Security Architecture (7.2 Data Security)
# Controls public access to the EKS API server
variable "cluster_endpoint_public_access" {
  description = "Enable public API server endpoint"
  type        = bool
  default     = false
}

# REQ: Security Architecture (7.2 Data Security)
# Configures control plane logging for audit and monitoring
variable "cluster_log_types" {
  description = "List of control plane logging types to enable"
  type        = list(string)
  default     = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  validation {
    condition     = alltrue([for log in var.cluster_log_types : contains(["api", "audit", "authenticator", "controllerManager", "scheduler"], log)])
    error_message = "Invalid log type specified. Valid values are: api, audit, authenticator, controllerManager, scheduler"
  }
}

# REQ: Container Orchestration (4.5 Deployment Architecture)
# Defines resource tagging for cost allocation and organization
variable "tags" {
  description = "Tags to be applied to all EKS cluster resources"
  type        = map(string)
  default     = {}
}