#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying PingSlot to AWS...${NC}"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$SCRIPT_DIR"
TF_DIR="$PROJECT_DIR/tf"

# Check for required tools
command -v terraform >/dev/null 2>&1 || { echo -e "${RED}Error: terraform is required but not installed.${NC}" >&2; exit 1; }
command -v aws >/dev/null 2>&1 || { echo -e "${RED}Error: aws cli is required but not installed.${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Error: docker is required but not installed.${NC}" >&2; exit 1; }

# Verify AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
aws sts get-caller-identity > /dev/null || { echo -e "${RED}Error: AWS credentials not configured.${NC}" >&2; exit 1; }

AWS_REGION=$(aws configure get region || echo "us-east-1")
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo -e "${GREEN}AWS Account: $AWS_ACCOUNT_ID${NC}"
echo -e "${GREEN}AWS Region: $AWS_REGION${NC}"

# Initialize and apply Terraform
echo -e "${YELLOW}Initializing Terraform...${NC}"
cd "$TF_DIR"
terraform init

echo -e "${YELLOW}Applying Terraform configuration...${NC}"
terraform apply -auto-approve

# Get outputs
ECR_REPO_URL=$(terraform output -raw ecr_repository_url)
ECS_CLUSTER=$(terraform output -raw ecs_cluster_name)
ECS_SERVICE=$(terraform output -raw ecs_service_name)
APP_URL=$(terraform output -raw app_url)

echo -e "${GREEN}ECR Repository: $ECR_REPO_URL${NC}"

# Build and push Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
cd "$PROJECT_DIR"

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO_URL

# Build the image
docker build --platform linux/amd64 -t pingslot .

# Tag and push
docker tag pingslot:latest $ECR_REPO_URL:latest
echo -e "${YELLOW}Pushing Docker image to ECR...${NC}"
docker push $ECR_REPO_URL:latest

# Force new deployment
echo -e "${YELLOW}Deploying to ECS...${NC}"
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment --region $AWS_REGION > /dev/null

# Wait for deployment
echo -e "${YELLOW}Waiting for deployment to complete (this may take 2-5 minutes)...${NC}"
aws ecs wait services-stable --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Your application is available at: ${APP_URL}${NC}"
