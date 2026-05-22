output "api_endpoint" {
  description = "Raw API Gateway endpoint (internal — routed via CloudFront /api/*)"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
  sensitive   = true
}

output "generate_url" {
  description = "Direct URL for the Gemini generate Lambda (internal)"
  value       = "${aws_apigatewayv2_api.http_api.api_endpoint}/api/generate"
  sensitive   = true
}

output "contact_url" {
  description = "Direct URL for the Resend contact Lambda (internal)"
  value       = "${aws_apigatewayv2_api.http_api.api_endpoint}/api/contact"
  sensitive   = true
}

output "website_bucket_name" {
  description = "S3 bucket name for frontend static assets"
  value       = aws_s3_bucket.website_bucket.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (used for cache invalidation in CI/CD)"
  value       = aws_cloudfront_distribution.main.id
}

output "website_url" {
  description = "Public website URL"
  value       = "https://${local.domain}"
}
