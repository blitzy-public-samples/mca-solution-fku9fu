# REQ: Document Storage (4.2.2 Data Storage Components)
# Export S3 bucket identifier for resource references and cross-module integration
output "bucket_id" {
  description = "The unique identifier of the S3 bucket used for document storage"
  value       = aws_s3_bucket.main.id
}

# REQ: Data Security (7.2.1 Encryption Standards)
# Export S3 bucket ARN for IAM policy configuration and cross-account access management
output "bucket_arn" {
  description = "The Amazon Resource Name (ARN) of the S3 bucket for IAM policy configuration"
  value       = aws_s3_bucket.main.arn
}

# REQ: Document Storage (4.2.2 Data Storage Components)
# Export S3 bucket domain name for application configuration and direct S3 access
output "bucket_domain_name" {
  description = "The fully-qualified domain name of the S3 bucket for application configuration"
  value       = aws_s3_bucket.main.bucket_domain_name
}