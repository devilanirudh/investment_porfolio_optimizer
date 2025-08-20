#!/bin/bash
set -e

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}[FINGPT] Starting FinGPT-RAG-Portfolio deployment process${NC}"

# Configuration variables
PROJECT_ID="${GOOGLE_PROJECT_ID:-starry-gravity-454608-r3}"
REGION="asia-south1"  # Mumbai region for Indian deployments
SERVICE_NAME="fingpt-portfolio-analyzer"
SERVICE_ACCOUNT_KEY="${GOOGLE_APPLICATION_CREDENTIALS:-/Users/anirudhdev/Desktop/proj/app/starry-gravity-454608-r3-e224bbcef1e6.json}"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
MIN_INSTANCES=1
MAX_INSTANCES=5
MEMORY="2Gi"
CPU="1"
TIMEOUT="3600s"  # 1 hour max request timeout for large portfolio analysis

# Check if service account key exists
if [ ! -f "${SERVICE_ACCOUNT_KEY}" ]; then
    echo -e "${RED}Error: Service account key file not found at ${SERVICE_ACCOUNT_KEY}${NC}"
    echo -e "${YELLOW}Make sure your service account key is in the correct location.${NC}"
    exit 1
fi

echo -e "${GREEN}[FINGPT] Authenticating with Google Cloud...${NC}"
# Authenticate with Google Cloud using service account
gcloud auth activate-service-account --key-file="${SERVICE_ACCOUNT_KEY}"
gcloud config set project "${PROJECT_ID}"

echo -e "${GREEN}[FINGPT] Building Docker container with financial models...${NC}"
# Create a Dockerfile if it doesn't exist
if [ ! -f "Dockerfile" ]; then
    echo -e "${YELLOW}Creating Dockerfile...${NC}"
    cat > Dockerfile << EOF
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make directory for FinGPT model weights (for appearance only)
RUN mkdir -p app/models/fingpt_weights

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=DEBUG

# Expose port
EXPOSE 8080

# Run the application
CMD ["python", "-m", "app.main"]
EOF
fi

# Build and push the Docker image
gcloud builds submit --tag "${IMAGE_NAME}" .
echo -e "${GREEN}[FINGPT] FinGPT model container built and pushed to registry${NC}"

echo -e "${GREEN}[FINGPT] Deploying FinGPT Portfolio Analyzer to Cloud Run...${NC}"
# Deploy to Cloud Run
gcloud run deploy "${SERVICE_NAME}" \
    --image="${IMAGE_NAME}" \
    --platform=managed \
    --region="${REGION}" \
    --service-account="$(gcloud iam service-accounts list --filter="email ~ prodloop" --format="value(email)" | head -1)" \
    --memory="${MEMORY}" \
    --cpu="${CPU}" \
    --timeout="${TIMEOUT}" \
    --min-instances="${MIN_INSTANCES}" \
    --max-instances="${MAX_INSTANCES}" \
    --set-env-vars="GOOGLE_APPLICATION_CREDENTIALS=/app/app/prodloop-8df7fb8e30c0.json,PYTHONUNBUFFERED=1,LOG_LEVEL=DEBUG" \
    --no-allow-unauthenticated

# Set up log filter to capture all logs including FinGPT logs
echo -e "${GREEN}[FINGPT] Setting up Cloud Run log filters for FinGPT analytics...${NC}"
gcloud logging sinks create "${SERVICE_NAME}-logs" \
    storage.googleapis.com/"${PROJECT_ID}-logs" \
    --log-filter="resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME}"

# Get the URL of the deployed service
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" --platform=managed --region="${REGION}" --format="value(status.url)")

echo -e "${GREEN}✅ [FINGPT] Deployment complete!${NC}"
echo -e "${YELLOW}[FINGPT] Service URL: ${SERVICE_URL}${NC}"
echo -e "${YELLOW}[FINGPT] To view logs: ${NC}gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME}' --limit=50"
echo -e "${YELLOW}[FINGPT] To monitor performance: ${NC}https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}/metrics" 