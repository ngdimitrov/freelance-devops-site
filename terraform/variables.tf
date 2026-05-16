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

# -1 = unreserved (no reservation). Reserving requires the account's total
# Lambda concurrency quota to be raised above 10 (request a Service Quota
# increase for "Concurrent executions"), otherwise PutFunctionConcurrency
# fails because unreserved must stay >= 10. Set to e.g. 5 once raised.
variable "gemini_reserved_concurrency" {
  description = "Reserved concurrent executions for the Gemini Lambda; -1 disables (account quota too low)"
  type        = number
  default     = -1
}

variable "resend_reserved_concurrency" {
  description = "Reserved concurrent executions for the Resend Lambda; -1 disables (account quota too low)"
  type        = number
  default     = -1
}