# REQ: Infrastructure Integration (4.5 Deployment Architecture)
# REQ: High Availability Infrastructure (8.1 Deployment Environment)

# VPC and Network Infrastructure Outputs
output "vpc_id" {
  description = "ID of the VPC hosting the MCA application infrastructure"
  value       = module.vpc.vpc_id
  sensitive   = false
}

output "public_subnet_ids" {
  description = "List of public subnet IDs in the VPC for internet-facing resources"
  value       = module.vpc.public_subnet_ids
  sensitive   = false
}

output "private_subnet_ids" {
  description = "List of private subnet IDs in the VPC for application workloads"
  value       = module.vpc.private_subnet_ids
  sensitive   = false
}

output "database_subnet_ids" {
  description = "List of database subnet IDs in the VPC for data tier resources"
  value       = module.vpc.database_subnet_ids
  sensitive   = false
}

# EKS Cluster Outputs
output "eks_cluster_name" {
  description = "Name of the EKS cluster for Kubernetes deployments"
  value       = module.eks.cluster_name
  sensitive   = false
}

output "eks_cluster_endpoint" {
  description = "Endpoint URL for the EKS cluster API server"
  value       = module.eks.cluster_endpoint
  sensitive   = false
}

output "eks_cluster_ca_data" {
  description = "Base64 encoded certificate authority data for EKS cluster authentication"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "eks_security_group_id" {
  description = "ID of the EKS cluster security group for network policy configuration"
  value       = module.eks.cluster_security_group_id
  sensitive   = false
}

# RDS Aurora PostgreSQL Outputs
output "rds_writer_endpoint" {
  description = "Writer endpoint URL for the Aurora PostgreSQL cluster"
  value       = module.rds.cluster_endpoint
  sensitive   = false
}

output "rds_reader_endpoint" {
  description = "Reader endpoint URL for the Aurora PostgreSQL cluster"
  value       = module.rds.reader_endpoint
  sensitive   = false
}

output "rds_cluster_id" {
  description = "Identifier of the Aurora PostgreSQL cluster"
  value       = module.rds.cluster_identifier
  sensitive   = false
}

# S3 Document Storage Outputs
output "document_bucket_id" {
  description = "ID of the S3 bucket used for document storage"
  value       = module.s3.document_bucket_id
  sensitive   = false
}

output "document_bucket_arn" {
  description = "ARN of the S3 bucket for IAM policy configuration"
  value       = module.s3.document_bucket_arn
  sensitive   = false
}