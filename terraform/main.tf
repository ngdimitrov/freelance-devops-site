terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    time = {
      source  = "hashicorp/time"
      version = "~> 0.12"
    }
  }

  backend "s3" {
    bucket       = "nikolaydimitrov-terraform-state-bucket"
    key          = "prod/terraform.tfstate"
    region       = "eu-north-1"
    use_lockfile = true
    encrypt      = true
  }
}

provider "aws" {
  region = "eu-north-1"
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  account_id  = data.aws_caller_identity.current.account_id
  kms_key_arn = "arn:aws:kms:${data.aws_region.current.name}:${local.account_id}:key/${var.kms_key_id}"
}

resource "aws_s3_bucket" "website_bucket" {
  bucket = "nikolaydimitrov.dev-frontend"
}

resource "aws_s3_bucket_public_access_block" "website_bucket" {
  bucket = aws_s3_bucket.website_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
