variable "service_name" {
  default     = "atc-stitcher-be"
  description = "Name of service"
  type        = string
}

variable "region" {
  type        = string
  description = "AWS region"
  default     = "us-east-2"
}

variable "project" {
  type        = string
  description = "Project name"
  default     = "atc-stitcher"
}

variable "env" {
  type        = string
  description = "Environment"
}

variable "container_port" {
  type        = number
  description = "port"
  default     = 3001
}

variable "tags" {

  type = object({
  })

  description = "Tags"

  default = {
    "Managed by" = "Terraform",
  }
}

variable "ecs_desired_count" {
  type        = number
  description = "ECS Desired Count"
  default     = 1
}

variable "ecs_min_count" {
  type        = number
  description = "ECS Min Count"
  default     = 1
}

variable "ecs_max_count" {
  type        = number
  description = "ECS Max Count"
  default     = 2
}

variable "ecs_scaling_mem_percentage" {
  type        = string
  description = "At which mem utilization percentage to scale up"
  default     = 80
}

variable "ecs_scaling_cpu_percentage" {
  type        = string
  description = "At which cpu utilization percentage to scale up"
  default     = 70
}

variable "ecs_task_cpu" {
  type        = number
  description = "ECS Task VCPU"
  default     = 256
}

variable "ecs_task_mem" {
  type        = number
  description = "ECS Task VCPU"
  default     = 512
}

variable "deploy_url" {
  type        = string
}

variable "document_url" {
  type        = string
}