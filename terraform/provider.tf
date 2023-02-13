terraform {
  required_version = ">= 1.0.3"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.11.0"
    }

    docker = {
      source  = "kreuzwerker/docker"
      version = "2.16.0"
    }
  }
}

provider "aws" {
  region                  = var.region
  skip_region_validation  = true
  skip_get_ec2_platforms  = true
  skip_metadata_api_check = true

  default_tags {
    tags = local.tags
  }
}




data "aws_ecr_authorization_token" "token" {}

data "aws_caller_identity" "identity" {}

provider "docker" {
  registry_auth {
    address  = "${data.aws_caller_identity.identity.account_id}.dkr.ecr.${var.region}.amazonaws.com"
    username = data.aws_ecr_authorization_token.token.user_name
    password = data.aws_ecr_authorization_token.token.password
  }
}

