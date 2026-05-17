variable "kms_key_id" {
  description = "KMS key ID used to encrypt Lambda environment variables at rest (ARN is built from the current account/region)"
  type        = string
  default     = "5a359d20-32e0-4eef-80ef-54003cef9aee"
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
  description = "Email for operational alerts (Lambda errors, budget) and the contact-form destination. Supplied via TF_VAR_alert_email; never hardcoded."
  type        = string

  validation {
    condition     = can(regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", var.alert_email))
    error_message = "alert_email must be a valid email address (set TF_VAR_alert_email)."
  }
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