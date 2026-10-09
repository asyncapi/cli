# ---- Base Alpine with Node ----
FROM node:24-alpine AS base

# Install required system packages
RUN apk add --update nghttp2 \
  && corepack enable

# ---- Build stage ----
FROM base AS build

WORKDIR /app

# 1. Copy package files + workspace packages first
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ./packages ./packages

# 2. Install dependencies (cached unless the package files change)
RUN pnpm install --frozen-lockfile --ignore-scripts

# 3. Copy the rest of the application code
COPY ./assets ./assets
COPY ./src ./src
COPY ./bin ./bin
COPY ./scripts ./scripts
COPY openapi.yaml ./
COPY *.json ./

# 4. Build the workspace optimizer first (api:build compiles optimize.ts, which imports it), then the API
RUN pnpm optimizer:build
RUN pnpm api:build

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

# Copy package files and workspace definition
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./

# Copy workspace packages (including the built @asyncapi/optimizer)
COPY --from=build /app/packages ./packages

# package.json "postinstall" points at scripts/enableAutoComplete.js — copy it so npm cannot fail looking for it
COPY --from=build /app/scripts ./scripts

# Install production dependencies and clean the pnpm store. Studio is now a
# development-only dependency, so it is excluded automatically.
RUN pnpm install --prod --frozen-lockfile --ignore-scripts \
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
