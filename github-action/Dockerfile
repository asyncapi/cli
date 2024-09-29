FROM node:18-alpine

# Create a non-root user
RUN addgroup -S myuser && adduser -S myuser -G myuser

# Install necessary packages
RUN apk add --no-cache bash git chromium

# Environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

FROM ubuntu:latest

# Copy the asyncapi directory
COPY tmp/asyncapi/ /asyncapi

# Create a script that runs the desired command
RUN echo "#!/bin/bash\n/asyncapi/bin/run" > /usr/local/bin/asyncapi

# Make the script executable
RUN chmod +x /usr/local/bin/asyncapi

RUN ls -l /usr/local/bin/asyncapi

# Change ownership to non-root user
RUN chown -R myuser:myuser /asyncapi /usr/local/bin/asyncapi || echo "Failed to change ownership"

# Copy the entrypoint script
COPY github-action/entrypoint.sh /entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /entrypoint.sh

FROM node:18-alpine 

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]
