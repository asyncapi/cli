# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy rest of the source and build
COPY . .
RUN npm run build && \
    npm prune --omit=dev && \
    rm -rf test docs .git

# Stage 2: Runtime
FROM ghcr.io/puppeteer/puppeteer:20.8.0

# Switch to root to create user and set up permissions
USER root

# Create non-root user
RUN groupadd -r myuser && useradd -r -g myuser myuser

# Copy built files from builder stage
WORKDIR /app
COPY --from=build /app /app

# Create symlink and set permission, as root
RUN ln -s /app/bin/run_bin /usr/local/bin/asyncapi && chmod +x /usr/local/bin/asyncapi

# Now switch to non-root user for runtime
USER myuser

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

ENTRYPOINT [ "asyncapi" ]
