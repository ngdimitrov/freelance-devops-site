terraform {
  backend "s3" {
    bucket = "nikolaydimitrov-terraform-state-bucket"
    key    = "prod/terraform.tfstate"
    region = "eu-north-1"
  }
}