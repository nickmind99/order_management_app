data "aws_vpc" "default" {
  default = true
}

resource "aws_security_group" "database" {
  name   = "${var.project}-db"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port   = 5432
    to_port     = 5432
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

resource "random_password" "database" {
  length  = 32
  special = false
}

resource "aws_db_instance" "main" {
  identifier              = "${var.project}-db"
  engine                  = "postgres"
  engine_version          = "16"
  instance_class          = "db.t4g.micro"
  allocated_storage       = 20
  storage_type            = "gp3"
  db_name                 = "orders"
  username                = "app"
  password                = random_password.database.result
  publicly_accessible     = true
  vpc_security_group_ids  = [aws_security_group.database.id]
  backup_retention_period = 1
  skip_final_snapshot     = true
  apply_immediately       = true
}

locals {
  database_url = "postgres://${aws_db_instance.main.username}:${random_password.database.result}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}?sslmode=no-verify"
}

resource "aws_ssm_parameter" "database_url" {
  name  = "/${var.project}/database-url"
  type  = "SecureString"
  value = local.database_url
}
