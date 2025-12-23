output "api_endpoint" {
  value = aws_apigatewayv2_api.http_api.api_endpoint
}

output "generate_url" {
  value = "${aws_apigatewayv2_api.http_api.api_endpoint}/api/generate"
}

output "contact_url" {
  value = "${aws_apigatewayv2_api.http_api.api_endpoint}/api/contact"
}