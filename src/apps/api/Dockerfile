# ---- Base Alpine with Node ----
FROM node:20-alpine AS base

# Install required system packages
RUN apk add --update nghttp2

# ---- Build stage ----
FROM base AS build

WORKDIR /app

# 1. Copy only package files first (for better caching)
COPY package*.json ./

# 2. Install dependencies (cached unless package*.json changes)
RUN CI=true npm install

# 3. Copy the rest of the application code
COPY ./assets ./assets
COPY ./src ./src
COPY ./bin ./bin
COPY ./scripts ./scripts
COPY openapi.yaml ./
COPY *.json ./

# 4. Build TypeScript or production-ready JS
RUN npm run api:build

# ---- Release stage ----
FROM base AS release

WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs \
  && adduser -S asyncapi -u 1001

# Copy built code
COPY --from=build /app/lib ./lib

# Copy package files
COPY --from=build /app/package*.json ./

# Install production deps, then remove heavy ones
RUN CI=true npm ci --omit=dev \
  && npm uninstall @asyncapi/studio next \
  && npm cache clean --force \
  && npm prune --production

# Copy OpenAPI document
COPY openapi.yaml ./

# Change ownership of the app directory to the non-root user
RUN chown -R asyncapi:nodejs /app

# Switch to non-root user
USER asyncapi

# Expose the application port
EXPOSE 80

ENV NODE_ENV=production
ENV PORT=80

CMD ["node", "lib/apps/api/server.js"]
