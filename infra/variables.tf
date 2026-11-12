variable "project" {
  type    = string
  default = "order-management"
}

variable "region" {
  type    = string
  default = "eu-north-1"
}

variable "openai_api_key" {
  type      = string
  sensitive = true
}

variable "openai_model" {
  type    = string
  default = "gpt-5.4-mini"
}
