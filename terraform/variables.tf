variable "kms_key_arn" {
  description = "KMS key ARN used to encrypt Lambda environment variables at rest"
  type        = string
  default     = "arn:aws:kms:eu-north-1:000000000000:key/5a359d20-32e0-4eef-80ef-54003cef9aee"
}

variable "gemini_api_key" {
  description = "API Key for Google Gemini"
  type        = string
  sensitive   = true
}

variable "resend_api_key" {
  description = "API Key for Resend"
  type        = string
  sensitive   = true
}