# Generated by Terragrunt. Sig: nIlQXj57tbuaRZEa
terraform {
  backend "s3" {
    bucket         = "atc-research-tf-platform-dev"
    dynamodb_table = "tf-atc-environment-infra-lock-dev"
    encrypt        = true
    key            = "apps/atc-stitcher/backend/dev/env.tfstate"
    region         = "us-east-2"
  }
}
