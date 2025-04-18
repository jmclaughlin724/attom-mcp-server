# Dockerfile for attom-mcp-plugin
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/openapi ./openapi

# Create and use non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs
USER nodeuser

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    ATTOM_API_BASE_URL="https://api.gateway.attomdata.com" \
    CACHE_TTL_DEFAULT=3600 \
    ATTOM_API_KEY="" \
    GOOGLE_MAPS_API_KEY=""

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ["sh", "-c", "wget -q --spider http://localhost:3000/mcp/health || exit 1"]

# Changed to run the server instead of the CLI
CMD ["node", "dist/server.js"]
