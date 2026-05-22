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

# --- IAM propagation barrier ------------------------------------------------

# IAM is eventually consistent, so newly granted deployer permissions may not
# be effective the instant the policy is applied. The resources gated on this
# delay use those permissions immediately on creation; the brief wait ensures
# propagation has completed before they run.
resource "time_sleep" "wait_for_iam_propagation" {
  depends_on = [aws_iam_role_policy.github_actions_deployer]

  # Re-create (and re-sleep) whenever the deployer policy changes, so a policy
  # update propagates before resources gated on this barrier run. Without a
  # trigger the sleep happens only once, on the barrier's first creation.
  triggers = {
    deployer_policy = sha1(aws_iam_role_policy.github_actions_deployer.policy)
  }

  create_duration = "30s"
}

# --- Lambda alarms ----------------------------------------------------------

locals {
  monitored_lambdas = {
    gemini = aws_lambda_function.gemini_api.function_name
    resend = aws_lambda_function.resend_api.function_name
  }
}

resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each   = local.monitored_lambdas
  depends_on = [time_sleep.wait_for_iam_propagation]

  alarm_name          = "${each.value}-errors"
  alarm_description   = "Lambda ${each.value} returned errors"
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
  for_each   = local.monitored_lambdas
  depends_on = [time_sleep.wait_for_iam_propagation]

  alarm_name          = "${each.value}-throttles"
  alarm_description   = "Lambda ${each.value} is being throttled (possible abuse or under-provisioned concurrency)"
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
  ok_actions    = [aws_sns_topic.alerts.arn]
}

# --- Cost guardrail ---------------------------------------------------------

resource "aws_budgets_budget" "monthly" {
  depends_on = [time_sleep.wait_for_iam_propagation]

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
