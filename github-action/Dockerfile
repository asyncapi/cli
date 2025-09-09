# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --ignore-scripts

# Copy only necessary files for build
COPY src/ ./src/
COPY assets/ ./assets/
COPY scripts/ ./scripts/
COPY bin/ ./bin/
COPY tsconfig.json ./

# Build the application
RUN npm run build && \
    npm prune --omit=dev && \
    rm -rf test docs .git tmp node_modules/.cache

# Stage 2: Runtime
FROM node:20-alpine

# Install necessary packages
RUN apk update && apk add --no-cache bash git && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy built application from build stage
COPY --from=build /app ./

# Create symlink for global access
RUN ln -s /app/bin/run_bin /usr/local/bin/asyncapi && \
    chmod +x /usr/local/bin/asyncapi

# Copy the entrypoint script
COPY github-action/entrypoint.sh /entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]
