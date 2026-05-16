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

variable "alert_email" {
  description = "Email address for operational alerts (Lambda errors, budget)"
  type        = string
  default     = "contact@example.com"
}

variable "monthly_budget_usd" {
  description = "Monthly AWS cost budget threshold in USD; alerts at 80% and 100%"
  type        = number
  default     = 10
}

variable "gemini_reserved_concurrency" {
  description = "Reserved concurrent executions for the Gemini Lambda (caps cost-abuse blast radius)"
  type        = number
  default     = 5
}

variable "resend_reserved_concurrency" {
  description = "Reserved concurrent executions for the Resend Lambda"
  type        = number
  default     = 5
}