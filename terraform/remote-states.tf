
data "terraform_remote_state" "platform_env" {
  backend = "s3"

  config = {
    key            = "global/platform/environmnet/${var.env}/env.tfstate"
    bucket         = "atc-research-tf-platform-${var.env}"
    dynamodb_table = "tf-atc-environment-infra-lock-${var.env}"
    region         = "us-east-2"
  }
}
