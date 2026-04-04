# Stage 1: Build stage with Node setup
FROM node:24-alpine as build

RUN corepack enable && corepack prepare pnpm@9.15.5 --activate

# Copy the source code
COPY ./ /tmp/source_code

# Install dependencies
WORKDIR /tmp/source_code
RUN pnpm install --frozen-lockfile --ignore-scripts

# Build the source code
RUN pnpm run build

# create libraries directory
RUN mkdir -p /libraries

# Copy the lib, bin, node_modules, and package.json files to the /libraries directory
RUN cp -r /tmp/source_code/lib /libraries
RUN cp -r /tmp/source_code/assets /libraries
RUN cp /tmp/source_code/package.json /libraries
RUN cp /tmp/source_code/pnpm-lock.yaml /libraries
RUN cp /tmp/source_code/oclif.manifest.json /libraries

# Copy the bin directory to the /libraries directory
RUN cp -r /tmp/source_code/bin /libraries

# Remove everything inside /tmp
RUN rm -rf /tmp/*

FROM node:24-alpine

RUN corepack enable && corepack prepare pnpm@9.15.5 --activate

# Install necessary packages
RUN apk add --no-cache bash git

# Copy the libraries directory from the build stage
COPY --from=build /libraries /libraries

RUN cd /libraries && pnpm install --frozen-lockfile --prod --ignore-scripts

# Create a non-root user
# RUN addgroup -S myuser && adduser -S myuser -G myuser

# Create a script that runs the desired command
RUN ln -s /libraries/bin/run_bin /usr/local/bin/asyncapi

# Make the script executable
RUN chmod +x /usr/local/bin/asyncapi

# Change ownership to non-root user
# RUN chown -R myuser:myuser /libraries /usr/local/bin/asyncapi || echo "Failed to change ownership"

# Copy the entrypoint script
COPY github-action/entrypoint.sh /entrypoint.sh

# Make the entrypoint executable
RUN chmod +x /entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]
