# --- Alerting channel -------------------------------------------------------

resource "aws_sns_topic" "alerts" {
  # Deployer policy must grant SNS/CloudWatch perms before these are created.
  depends_on = [aws_iam_role_policy.github_actions_deployer]

  name = "site-ops-alerts"
}

# Email subscription must be confirmed via the link AWS sends on first apply.
resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# --- Lambda alarms ----------------------------------------------------------

locals {
  monitored_lambdas = {
    gemini = aws_lambda_function.gemini_api.function_name
    resend = aws_lambda_function.resend_api.function_name
  }
}

resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each = local.monitored_lambdas

  alarm_name          = "${each.value}-errors"
  alarm_description    = "Lambda ${each.value} returned errors"
  namespace           = "AWS/Lambda"
  metric_name         = "Errors"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = each.value
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  for_each = local.monitored_lambdas

  alarm_name          = "${each.value}-throttles"
  alarm_description    = "Lambda ${each.value} is being throttled (possible abuse or under-provisioned concurrency)"
  namespace           = "AWS/Lambda"
  metric_name         = "Throttles"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 5
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = each.value
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

# --- Cost guardrail ---------------------------------------------------------

# The budget was created by a prior partial apply (tag read failed after
# CreateBudget succeeded), so adopt the existing one instead of recreating.
import {
  to = aws_budgets_budget.monthly
  id = "000000000000:monthly-cost-budget"
}

resource "aws_budgets_budget" "monthly" {
  depends_on = [aws_iam_role_policy.github_actions_deployer]

  name         = "monthly-cost-budget"
  budget_type  = "COST"
  limit_amount = tostring(var.monthly_budget_usd)
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.alert_email]
  }
}
