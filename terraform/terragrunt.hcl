 remote_state {
  backend = "s3"
  generate = {
    path      = "tg-tf-backed-state.tf"
    if_exists = "overwrite_terragrunt"
  }
  config = {
    bucket         = "atc-research-tf-platform-${get_env("DEPLOY_ENV")}"
    key            = "apps/atc-stitcher/backend/${get_env("DEPLOY_ENV")}/env.tfstate"
    region         = "us-east-2"
    dynamodb_table = "tf-atc-environment-infra-lock-${get_env("DEPLOY_ENV")}"   
	encrypt        = true
  }
}

terraform {
  extra_arguments "retry_lock" {
    commands = get_terraform_commands_that_need_locking()
    arguments = [
      "-lock-timeout=5m"
    ]
  }

  extra_arguments "custom_vars" {
    commands = get_terraform_commands_that_need_vars()
    required_var_files = [
      "${get_terragrunt_dir()}/env/${get_env("DEPLOY_ENV")}.tfvars"
    ]

    arguments = [
      "-var", "env=${get_env("DEPLOY_ENV")}",
    ]
  }
}