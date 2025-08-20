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
RUN npm install --ignore-scripts

# 3. Copy the rest of the application code
COPY . .

# 4. Build TypeScript or production-ready JS
RUN npm run api:build

# ---- Release stage ----
FROM base AS release

WORKDIR /app

# Copy built code
COPY --from=build /app/lib ./lib

# Copy package files
COPY --from=build /app/package*.json ./

# Install production deps, then remove heavy ones
RUN npm ci --omit=dev --ignore-scripts \
  && npm uninstall @asyncapi/studio next \
  && npm cache clean --force \
  && npm prune --production

# Copy OpenAPI document
COPY openapi.yaml ./

# Expose the application port
EXPOSE 80

ENV NODE_ENV=production
ENV PORT=80

CMD ["node", "lib/apps/api/server.js"]
