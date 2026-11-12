resource "aws_ecr_repository" "api" {
  name         = "${var.project}-api"
  force_delete = true
}
