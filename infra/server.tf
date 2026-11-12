data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "aws_iam_role" "server" {
  name = "${var.project}-server"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "server_ssm" {
  role       = aws_iam_role.server.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "server_ecr" {
  role       = aws_iam_role.server.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy" "server_app" {
  name = "app"
  role = aws_iam_role.server.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "ssm:GetParameter"
        Resource = aws_ssm_parameter.database_url.arn
      },
      {
        Effect   = "Allow"
        Action   = "lambda:InvokeFunction"
        Resource = aws_lambda_function.generator.arn
      },
    ]
  })
}

resource "aws_iam_instance_profile" "server" {
  name = "${var.project}-server"
  role = aws_iam_role.server.name
}

resource "aws_security_group" "server" {
  name   = "${var.project}-server"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

locals {
  deploy_script = templatefile("${path.module}/deploy.sh.tftpl", {
    region                 = var.region
    registry               = split("/", aws_ecr_repository.api.repository_url)[0]
    api_image              = "${aws_ecr_repository.api.repository_url}:latest"
    redis_image            = var.redis_image
    database_url_parameter = aws_ssm_parameter.database_url.name
    generator_lambda_name  = aws_lambda_function.generator.function_name
    web_url                = "http://${aws_s3_bucket_website_configuration.web.website_endpoint}"
  })
}

resource "aws_instance" "server" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.instance_type
  iam_instance_profile        = aws_iam_instance_profile.server.name
  vpc_security_group_ids      = [aws_security_group.server.id]
  user_data                   = templatefile("${path.module}/user-data.sh.tftpl", { deploy_script = local.deploy_script })
  user_data_replace_on_change = true

  metadata_options {
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  root_block_device {
    volume_type = "gp3"
    volume_size = 20
  }

  tags = { Name = "${var.project}-server" }

  lifecycle {
    ignore_changes = [ami]
  }
}

resource "aws_eip" "server" {
  instance = aws_instance.server.id
}
