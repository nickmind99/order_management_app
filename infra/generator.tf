resource "aws_ssm_parameter" "openai_api_key" {
  name  = "/${var.project}/openai-api-key"
  type  = "SecureString"
  value = var.openai_api_key
}

data "archive_file" "generator" {
  type        = "zip"
  source_file = "${path.module}/../packages/generator/lambda/index.js"
  output_path = "${path.module}/build/generator.zip"
}

resource "aws_iam_role" "generator" {
  name = "${var.project}-generator"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "generator_logs" {
  role       = aws_iam_role.generator.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "generator_secrets" {
  name = "read-secrets"
  role = aws_iam_role.generator.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "ssm:GetParameters"
      Resource = [aws_ssm_parameter.database_url.arn, aws_ssm_parameter.openai_api_key.arn]
    }]
  })
}

resource "aws_cloudwatch_log_group" "generator" {
  name              = "/aws/lambda/${var.project}-generator"
  retention_in_days = 14
}

resource "aws_lambda_function" "generator" {
  function_name    = "${var.project}-generator"
  role             = aws_iam_role.generator.arn
  runtime          = "nodejs22.x"
  architectures    = ["arm64"]
  handler          = "index.handler"
  filename         = data.archive_file.generator.output_path
  source_code_hash = data.archive_file.generator.output_base64sha256
  memory_size      = 512
  timeout          = 180

  environment {
    variables = {
      DATABASE_URL_PARAMETER   = aws_ssm_parameter.database_url.name
      OPENAI_API_KEY_PARAMETER = aws_ssm_parameter.openai_api_key.name
      OPENAI_MODEL             = var.openai_model
    }
  }

  depends_on = [aws_iam_role_policy_attachment.generator_logs, aws_cloudwatch_log_group.generator]
}

resource "aws_cloudwatch_event_rule" "generator_hourly" {
  name                = "${var.project}-generator-hourly"
  schedule_expression = "rate(1 hour)"
}

resource "aws_cloudwatch_event_target" "generator" {
  rule = aws_cloudwatch_event_rule.generator_hourly.name
  arn  = aws_lambda_function.generator.arn
}

resource "aws_lambda_permission" "eventbridge" {
  statement_id  = "AllowEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generator.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.generator_hourly.arn
}
