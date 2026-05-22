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

  default_tags {
    tags = {
      Project   = "portfolio-devops-website"
      ManagedBy = "terraform"
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "portfolio-devops-website"
      ManagedBy = "terraform"
    }
  }
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  account_id  = data.aws_caller_identity.current.account_id
  domain      = "nikolaydimitrov.dev"
  kms_key_arn = "arn:aws:kms:${data.aws_region.current.name}:${local.account_id}:key/${var.kms_key_id}"
}

resource "aws_s3_bucket" "website_bucket" {
  bucket = "${local.domain}-frontend"

  # Tagging via provider default_tags needs s3:PutBucketTagging, granted by the
  # deployer policy in this same apply — wait for the IAM propagation barrier.
  depends_on = [time_sleep.wait_for_iam_propagation]
}

resource "aws_s3_bucket_versioning" "website_bucket" {
  bucket = aws_s3_bucket.website_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Versioning keeps every overwritten object forever; expire old versions so the
# bucket (and cost) does not grow unbounded across deploys.
resource "aws_s3_bucket_lifecycle_configuration" "website_bucket" {
  bucket = aws_s3_bucket.website_bucket.id

  rule {
    id     = "expire-noncurrent-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

resource "aws_s3_bucket_public_access_block" "website_bucket" {
  bucket = aws_s3_bucket.website_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
