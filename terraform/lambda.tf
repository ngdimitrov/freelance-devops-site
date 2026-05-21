resource "aws_iam_role" "lambda_role" {
  name = "serverless_lambda_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_kms" {
  name = "lambda-kms-decrypt"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = [
          local.kms_key_arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_cloudwatch_log_group" "gemini_api" {
  name              = "/aws/lambda/geminiChatFunction"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "resend_api" {
  name              = "/aws/lambda/sendEmailFunction"
  retention_in_days = 30
}

resource "aws_lambda_function" "gemini_api" {
  # Ensures the deployer policy (granting lambda:PutFunctionConcurrency) is
  # applied before reserved concurrency is set, avoiding an IAM-propagation race.
  depends_on = [aws_iam_role_policy.github_actions_deployer]

  filename      = "../gemini.zip"
  function_name = "geminiChatFunction"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  timeout       = 20
  kms_key_arn   = local.kms_key_arn

  reserved_concurrent_executions = var.gemini_reserved_concurrency

  source_code_hash = filebase64sha256("../gemini.zip")

  environment {
    variables = {
      GEMINI_API_KEY = var.gemini_api_key
    }
  }
}

resource "aws_lambda_function" "resend_api" {
  depends_on = [aws_iam_role_policy.github_actions_deployer]

  filename      = "../resend.zip"
  function_name = "sendEmailFunction"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  timeout       = 3
  kms_key_arn   = local.kms_key_arn

  reserved_concurrent_executions = var.resend_reserved_concurrency

  source_code_hash = filebase64sha256("../resend.zip")

  environment {
    variables = {
      RESEND_API_KEY   = var.resend_api_key
      CONTACT_TO_EMAIL = var.alert_email
    }
  }
}