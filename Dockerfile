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
RUN npm run build && \
    npm prune --omit=dev && \
    rm -rf test docs .git tmp node_modules/.cache

# Stage 2: Runtime
FROM ghcr.io/puppeteer/puppeteer:20.8.0

# Switch to root to create user and set up permissions
USER root

# Install git (needed by AsyncAPI CLI)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r asyncapi && useradd -r -g asyncapi asyncapi

# Copy built files from builder stage
WORKDIR /app
COPY --from=build /app /app

# Create symlink and set permissions
RUN ln -s /app/bin/run_bin /usr/local/bin/asyncapi && \
    chmod +x /usr/local/bin/asyncapi && \
    chown -R asyncapi:asyncapi /app

# Switch to non-root user for runtime
USER asyncapi

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

ENTRYPOINT [ "asyncapi" ]
