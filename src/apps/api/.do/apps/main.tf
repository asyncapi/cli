terraform {
  required_version = ">= 1.0.0"

  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = ">= 2.0.0"
    }
  }
}

provider "digitalocean" {}

resource "digitalocean_app" "server-api" {
  spec {
    name = "server-api"
    region = "sfo3"

    domain {
      name = "api.asyncapi.com"
      type = "PRIMARY"
    }

    ingress {
      rule {
        component {
          name = "asyncapi-server-api"
        }
        match {
          path {
            prefix = "/"
          }
        }
        cors {
          allow_origins {
           exact = "*"
          }
          allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
          allow_headers = ["*"]
        }
      }
    }

    service {
      name = "asyncapi-server-api"
      http_port = 80
      health_check {
        http_path = "/v1/help/validate"
        port = 80
      }
      env {
        key = "PORT"
        value = "80"
      }

      image {
        registry_type = "DOCKER_HUB"
        registry = "asyncapi"
        repository = "server-api"
        tag = "latest"
      }

      instance_count = 1
      instance_size_slug = "basic-xs" // $10/month

      alert {
        rule = "CPU_UTILIZATION"
        value = 80
        operator = "GREATER_THAN"
        window = "TEN_MINUTES"
      }
    }

    alert {
      rule = "DEPLOYMENT_FAILED"
    }
  }
}

output "live_url" {
  value = digitalocean_app.server-api.default_ingress
}
