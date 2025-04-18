#!/bin/bash

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  source .env
fi

# Run the container with environment variables
docker run -p 3000:3000 \
  -e ATTOM_API_KEY=${ATTOM_API_KEY:-"your_attom_api_key_here"} \
  -e GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY:-"your_google_maps_api_key_here"} \
  -e ATTOM_API_BASE_URL=${ATTOM_API_BASE_URL:-"https://api.gateway.attomdata.com"} \
  -e CACHE_TTL_DEFAULT=${CACHE_TTL_DEFAULT:-3600} \
  -e REDIS_URL=${REDIS_URL:-"redis://localhost:6379"} \
  -e MAX_FALLBACK_ATTEMPTS=${MAX_FALLBACK_ATTEMPTS:-3} \
  -e FALLBACK_DELAY_MS=${FALLBACK_DELAY_MS:-500} \
  attom-mcp-server
