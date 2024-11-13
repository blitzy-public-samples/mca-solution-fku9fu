# REQ: High Availability Infrastructure (4.5 Deployment Architecture)
# Exposes VPC ID and CIDR block for use by other modules
output "vpc_id" {
  description = "The ID of the created VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "The CIDR block of the created VPC"
  value       = aws_vpc.main.cidr_block
}

# REQ: High Availability Infrastructure (4.5 Deployment Architecture)
# REQ: Network Security (7.3.1 Network Security)
# Exposes subnet IDs for each tier to enable multi-AZ deployments
output "public_subnet_ids" {
  description = "List of IDs of public subnets across all availability zones"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of IDs of private subnets across all availability zones"
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "List of IDs of database subnets across all availability zones"
  value       = aws_subnet.database[*].id
}

# REQ: Network Security (7.3.1 Network Security)
# Exposes CIDR blocks for each subnet tier to facilitate security group rules
output "public_subnet_cidrs" {
  description = "List of CIDR blocks of public subnets across all availability zones"
  value       = aws_subnet.public[*].cidr_block
}

output "private_subnet_cidrs" {
  description = "List of CIDR blocks of private subnets across all availability zones"
  value       = aws_subnet.private[*].cidr_block
}

output "database_subnet_cidrs" {
  description = "List of CIDR blocks of database subnets across all availability zones"
  value       = aws_subnet.database[*].cidr_block
}