output "database_url" {
  value     = local.database_url
  sensitive = true
}

output "web_url" {
  value = "http://${aws_s3_bucket_website_configuration.web.website_endpoint}"
}

output "web_bucket" {
  value = aws_s3_bucket.web.bucket
}

output "api_url" {
  value = "http://${aws_eip.server.public_ip}:3000/api"
}

output "instance_id" {
  value = aws_instance.server.id
}

output "api_repository_url" {
  value = aws_ecr_repository.api.repository_url
}
