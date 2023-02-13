
resource "random_password" "jwt_secret" {
  length           = 16
  special          = false
  override_special = ""
}

resource "random_password" "jwt_secret_two" {
  length           = 16
  special          = false
  override_special = ""
}


resource "aws_ecs_task_definition" "td" {
  family                   = var.service_name
  depends_on               = [docker_registry_image.image]
  execution_role_arn       = data.terraform_remote_state.platform_env.outputs.stitcher_app.ecs_role_arn
  task_role_arn            = data.terraform_remote_state.platform_env.outputs.stitcher_app.ecs_role_arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_mem

  container_definitions = jsonencode([
    {
      name      = "${var.service_name}-${var.env}"
      image     = local.docker_ecr_image
      essential = true
      portMappings = [
        {
          containerPort = 3001
          hostPort      = 3001
        }
      ]
      environment = [
        {
          "name"  = "PORT"
          "value" = "3001"
        },
        {
          "name"  = "JWT_SECRET"
          "value" = random_password.jwt_secret.result
        },
        {
          "name"  = "JWT_EXPIRY"
          "value" = "6h"
        },
        {
          "name"  = "JWT_REFRESH_SECRET"
          "value" = random_password.jwt_secret_two.result
        },
        {
          "name"  = "JWT_REFRESH_EXPIRY"
          "value" = "12h"
        },
        {
          "name"  = "ENVIRONMENT"
          "value" = var.env
        },
        {
          "name"  = "DEPLOY_URL"
          "value" = var.deploy_url
        },
        {
          "name"  = "BUCKET_URL"
          "value" = var.document_url 
        }
      ]

      secrets = [
        {
          name      = "MONGO_URI",
          valueFrom = "${data.terraform_remote_state.platform_env.outputs.ssm_url_mongodb_stitcher_arn}"

        }
      ]

      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = "${var.service_name}-${var.env}"
          awslogs-region        = "${var.region}"
          awslogs-stream-prefix = "ecs-fg"
        }
      }

    }
  ])


}

resource "aws_security_group" "ecs" {
  name   = "${var.project}-sg-ecs-${var.env}"
  vpc_id = data.terraform_remote_state.platform_env.outputs.stitcher_app.ecs_vpc.id
  ingress {
    protocol         = "tcp"
    from_port        = 3001
    to_port          = 3001
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}


resource "aws_ecs_service" "service" {
  name                               = "${var.service_name}-${var.env}"
  cluster                            = data.terraform_remote_state.platform_env.outputs.stitcher_app.ecs_cluster.name
  task_definition                    = aws_ecs_task_definition.td.arn
  desired_count                      = var.ecs_desired_count
  deployment_minimum_healthy_percent = 0
  launch_type                        = "FARGATE"
  scheduling_strategy                = "REPLICA"
  propagate_tags                     = "TASK_DEFINITION"
  wait_for_steady_state              = false
  enable_execute_command             = true

  network_configuration {
    security_groups  = [aws_security_group.ecs.id]
    subnets          = data.terraform_remote_state.platform_env.outputs.stitcher_app.ecs_vpc.private_ips
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = data.terraform_remote_state.platform_env.outputs.stitcher_app.ecs_tg_arn
    container_name   = "${var.service_name}-${var.env}"
    container_port   = var.container_port
  }

  lifecycle {
    ignore_changes = [desired_count]
  }
}



resource "aws_cloudwatch_log_group" "logs" {
  name              = "${var.service_name}-${var.env}"
  retention_in_days = 3

}



resource "aws_appautoscaling_target" "scaler_target" {
  max_capacity       = var.ecs_max_count
  min_capacity       = var.ecs_min_count
  resource_id        = "service/${data.terraform_remote_state.platform_env.outputs.stitcher_app.ecs_cluster.name}/${aws_ecs_service.service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "autoscaling_memory" {
  name               = "dev-to-memory"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.scaler_target.resource_id
  scalable_dimension = aws_appautoscaling_target.scaler_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.scaler_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }

    target_value = var.ecs_scaling_mem_percentage
  }
}

resource "aws_appautoscaling_policy" "autoscaling_cpu" {
  name               = "dev-to-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.scaler_target.resource_id
  scalable_dimension = aws_appautoscaling_target.scaler_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.scaler_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value = var.ecs_scaling_cpu_percentage
  }
}