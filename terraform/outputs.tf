output "api_endpoint" {
  value = aws_apigatewayv2_api.http_api.api_endpoint
}

output "generate_url" {
  value = "${aws_apigatewayv2_api.http_api.api_endpoint}/api/generate"
}

output "contact_url" {
  value = "${aws_apigatewayv2_api.http_api.api_endpoint}/api/contact"
}

output "website_bucket_name" {
  value       = aws_s3_bucket.website_bucket.id
  description = "The name of the S3 bucket for frontend"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.main.id
  description = "The ID of the CloudFront distribution"
}

output "website_url" {
  value       = "https://nikolaydimitrov.dev"
}