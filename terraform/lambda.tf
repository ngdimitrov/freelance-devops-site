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
      RESEND_API_KEY = var.resend_api_key
    }
  }
}