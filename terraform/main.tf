locals {

  tags = merge(var.tags, { "region" = var.region, "managed-by" = "Terraform" })

  version          = substr(sha1(join("", [filesha1("../Dockerfile")], [for f in fileset("../app", "**") : filesha1("../app/${f}")])), 0, 12)
  docker_image_tag = "img-${local.version}"
  docker_ecr_image = format("%v:%v", data.terraform_remote_state.platform_env.outputs.stitcher_app.ecr_repo.url, local.docker_image_tag)

}