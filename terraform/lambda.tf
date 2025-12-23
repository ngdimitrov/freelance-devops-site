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

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "gemini_api" {
  filename      = "../gemini.zip"
  function_name = "geminiChatFunction"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  timeout       = 10

  source_code_hash = filebase64sha256("../gemini.zip")

  environment {
    variables = {
      GEMINI_API_KEY = var.gemini_api_key
    }
  }
}

resource "aws_lambda_function" "resend_api" {
  filename      = "../resend.zip"
  function_name = "sendEmailFunction"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  timeout       = 4

  source_code_hash = filebase64sha256("../resend.zip")

  environment {
    variables = {
      RESEND_API_KEY = var.resend_api_key
    }
  }
}