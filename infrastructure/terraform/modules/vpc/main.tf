# Human Tasks:
# 1. Verify AWS credentials and permissions for VPC resource creation
# 2. Confirm availability zones specified in tfvars are valid for the target region
# 3. Review and validate CIDR block allocations for subnet tiers
# 4. Ensure NAT Gateway service quotas are sufficient for multi-AZ deployment

# Required Provider Versions
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws" # version ~> 5.0
      version = "~> 5.0"
    }
  }
}

# REQ: Network Security (7.3.1 Network Security)
# Creates the main VPC with DNS support enabled
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = var.enable_dns_hostnames
  enable_dns_support   = var.enable_dns_support

  tags = merge(
    {
      Name        = "${var.name_prefix}-vpc"
      Environment = var.environment
      ManagedBy   = "terraform"
    },
    var.tags
  )
}

# REQ: High Availability Infrastructure (4.5 Deployment Architecture)
# Creates public subnets across multiple availability zones
resource "aws_subnet" "public" {
  count                   = length(var.azs)
  vpc_id                  = aws_vpc.main.id
  cidr_block             = var.public_subnets[count.index]
  availability_zone      = var.azs[count.index]
  map_public_ip_on_launch = true

  tags = merge(
    {
      Name        = "${var.name_prefix}-public-${var.azs[count.index]}"
      Environment = var.environment
      Tier        = "public"
    },
    var.tags
  )
}

# REQ: Network Security (7.3.1 Network Security)
# Creates private subnets for application tier
resource "aws_subnet" "private" {
  count             = length(var.azs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = var.azs[count.index]

  tags = merge(
    {
      Name        = "${var.name_prefix}-private-${var.azs[count.index]}"
      Environment = var.environment
      Tier        = "private"
    },
    var.tags
  )
}

# REQ: Network Security (7.3.1 Network Security)
# Creates private subnets for database tier
resource "aws_subnet" "database" {
  count             = length(var.azs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.database_subnets[count.index]
  availability_zone = var.azs[count.index]

  tags = merge(
    {
      Name        = "${var.name_prefix}-database-${var.azs[count.index]}"
      Environment = var.environment
      Tier        = "database"
    },
    var.tags
  )
}

# REQ: Network Security (7.3.1 Network Security)
# Creates Internet Gateway for public subnet internet access
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    {
      Name        = "${var.name_prefix}-igw"
      Environment = var.environment
    },
    var.tags
  )
}

# REQ: Production Environment (8.1 Deployment Environment)
# Allocates Elastic IPs for NAT Gateways
resource "aws_eip" "nat" {
  count  = var.single_nat_gateway ? 1 : length(var.azs)
  domain = "vpc"

  tags = merge(
    {
      Name        = "${var.name_prefix}-eip-${count.index + 1}"
      Environment = var.environment
    },
    var.tags
  )
}

# REQ: High Availability Infrastructure (4.5 Deployment Architecture)
# Creates NAT Gateways for private subnet internet access
resource "aws_nat_gateway" "main" {
  count         = var.single_nat_gateway ? 1 : length(var.azs)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  depends_on = [aws_internet_gateway.main]

  tags = merge(
    {
      Name        = "${var.name_prefix}-nat-${count.index + 1}"
      Environment = var.environment
    },
    var.tags
  )
}

# REQ: Network Security (7.3.1 Network Security)
# Creates route table for public subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(
    {
      Name        = "${var.name_prefix}-public-rt"
      Environment = var.environment
      Tier        = "public"
    },
    var.tags
  )
}

# REQ: Network Security (7.3.1 Network Security)
# Creates route tables for private subnets
resource "aws_route_table" "private" {
  count  = var.single_nat_gateway ? 1 : length(var.azs)
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = merge(
    {
      Name        = "${var.name_prefix}-private-rt-${count.index + 1}"
      Environment = var.environment
      Tier        = "private"
    },
    var.tags
  )
}

# REQ: Network Security (7.3.1 Network Security)
# Creates route tables for database subnets
resource "aws_route_table" "database" {
  count  = var.single_nat_gateway ? 1 : length(var.azs)
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = merge(
    {
      Name        = "${var.name_prefix}-database-rt-${count.index + 1}"
      Environment = var.environment
      Tier        = "database"
    },
    var.tags
  )
}

# Associate public subnets with public route table
resource "aws_route_table_association" "public" {
  count          = length(var.azs)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Associate private subnets with private route tables
resource "aws_route_table_association" "private" {
  count          = length(var.azs)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = var.single_nat_gateway ? aws_route_table.private[0].id : aws_route_table.private[count.index].id
}

# Associate database subnets with database route tables
resource "aws_route_table_association" "database" {
  count          = length(var.azs)
  subnet_id      = aws_subnet.database[count.index].id
  route_table_id = var.single_nat_gateway ? aws_route_table.database[0].id : aws_route_table.database[count.index].id
}