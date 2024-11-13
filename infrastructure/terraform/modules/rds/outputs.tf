# REQ: Database Infrastructure (4.2.2 Data Storage Components)
# Primary writer endpoint for database connections
output "cluster_endpoint" {
  description = "Writer endpoint for the RDS cluster"
  value       = aws_rds_cluster.main.endpoint
}

# REQ: High Availability (8.1 DEPLOYMENT ENVIRONMENT)
# Load-balanced reader endpoint for read replicas
output "reader_endpoint" {
  description = "Reader endpoint for the RDS cluster"
  value       = aws_rds_cluster.main.reader_endpoint
}

# REQ: Database Infrastructure (4.2.2 Data Storage Components)
# Port number for database connections
output "port" {
  description = "Port number for database connections"
  value       = aws_rds_cluster.main.port
}

# REQ: Security Configuration (7.2 DATA SECURITY)
# Security group ID for network access control
output "security_group_id" {
  description = "ID of the security group controlling database access"
  value       = aws_security_group.rds.id
}

# REQ: Database Infrastructure (4.2.2 Data Storage Components)
# Cluster identifier for reference and management
output "cluster_identifier" {
  description = "Identifier of the RDS cluster"
  value       = aws_rds_cluster.main.cluster_identifier
}

# REQ: Database Infrastructure (4.2.2 Data Storage Components)
# Database name for application configuration
output "database_name" {
  description = "Name of the created database"
  value       = aws_rds_cluster.main.database_name
}