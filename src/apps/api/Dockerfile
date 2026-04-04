# ---- Base Alpine with Node ----
FROM node:24-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.5 --activate

# Install required system packages
RUN apk add --update nghttp2

# ---- Build stage ----
FROM base AS build

WORKDIR /app

# 1. Copy only package files first (for better caching)
COPY package.json pnpm-lock.yaml ./

# 2. Install dependencies (cached unless package files change)
RUN pnpm install --frozen-lockfile --ignore-scripts

# 3. Copy the rest of the application code
COPY ./assets ./assets
COPY ./src ./src
COPY ./bin ./bin
COPY ./scripts ./scripts
COPY openapi.yaml ./
COPY *.json ./

# 4. Build TypeScript or production-ready JS
RUN pnpm run api:build

# ---- Templates stage ----
FROM base AS templates

# Copy templates list
COPY ./src/apps/api/templates.json /tmp/templates.json

# Install generator templates globally using the templates.json array
# This layer will be cached unless template versions change
RUN TEMPLATES=$(node -e "console.log(JSON.parse(require('fs').readFileSync('/tmp/templates.json', 'utf8')).join(' '))") && \
    npm install -g $TEMPLATES

# ---- Release stage ----
FROM base AS release

WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs \
  && adduser -S asyncapi -u 1001

# Copy built code
COPY --from=build /app/lib ./lib

# Copy package files
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-lock.yaml ./

# Install production deps, then remove heavy ones
RUN pnpm install --frozen-lockfile --prod --ignore-scripts \
  && pnpm remove @asyncapi/studio \
  && rm -rf node_modules/next \
  && pnpm store prune

# Copy globally installed templates from templates stage
COPY --from=templates /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=templates /usr/local/bin /usr/local/bin

# Copy OpenAPI document
COPY openapi.yaml ./

# Change ownership of the app directory to the non-root user
RUN chown -R asyncapi:nodejs /app

# Change ownership of node_modules to the non-root user
RUN chown -R asyncapi:nodejs /usr/local/lib/node_modules

# Switch to non-root user
USER asyncapi

# Expose the application port
EXPOSE 80

ENV NODE_ENV=production
ENV PORT=80

CMD ["node", "lib/apps/api/server.js"]
