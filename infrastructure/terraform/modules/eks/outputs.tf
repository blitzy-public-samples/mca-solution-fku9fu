# REQ: Container Orchestration (4.4 Cross-Cutting Concerns)
# Output cluster identifier for container orchestration and service deployment
output "cluster_id" {
  description = "ID of the created EKS cluster"
  value       = aws_eks_cluster.main.id
}

# REQ: Production Environment (8.1 Deployment Environment)
# Output cluster endpoint for API server access in production environment
output "cluster_endpoint" {
  description = "Endpoint URL for the EKS cluster API server"
  value       = aws_eks_cluster.main.endpoint
}

# REQ: Infrastructure Integration (8.2 Cloud Services)
# Output cluster certificate data for secure authentication
output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required for cluster authentication"
  value       = aws_eks_cluster.main.certificate_authority[0].data
  sensitive   = true
}

# REQ: Container Orchestration (4.4 Cross-Cutting Concerns)
# Output Kubernetes version for compatibility checks
output "cluster_version" {
  description = "Kubernetes version of the EKS cluster"
  value       = aws_eks_cluster.main.version
}

# REQ: Infrastructure Integration (8.2 Cloud Services)
# Output security group ID for network integration
output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}

# REQ: Production Environment (8.1 Deployment Environment)
# Output node groups information for workload management
output "node_groups" {
  description = "Map of all node groups created with their status"
  value       = aws_eks_node_group.main
}

# REQ: Infrastructure Integration (8.2 Cloud Services)
# Output cluster IAM role ARN for service integration
output "cluster_iam_role_arn" {
  description = "ARN of the IAM role used by the EKS cluster"
  value       = aws_eks_cluster.main.role_arn
}

# REQ: Infrastructure Integration (8.2 Cloud Services)
# Output primary security group ID for network security configuration
output "cluster_primary_security_group_id" {
  description = "The cluster primary security group ID created by EKS for the cluster"
  value       = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}