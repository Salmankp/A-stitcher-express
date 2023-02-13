
resource "docker_registry_image" "image" {
  name = local.docker_ecr_image

  build {
    context    = "../"
    dockerfile = "Dockerfile"
  }
}
