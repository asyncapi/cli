# Stage 1: Build stage with Node setup
FROM node:18-alpine as build

# Copy the source code 
COPY ./ /tmp/source_code

# Install dependencies
RUN cd /tmp/source_code && npm install

# Build the source code
RUN cd /tmp/source_code && npm run build

# create libraries directory
RUN mkdir -p /libraries

# Copy the lib, bin, node_modules, and package.json files to the /libraries directory
RUN cp -r /tmp/source_code/lib /libraries
RUN cp -r /tmp/source_code/node_modules /libraries
RUN cp -r /tmp/source_code/assets /libraries
RUN cp /tmp/source_code/package.json /libraries
RUN cp /tmp/source_code/package-lock.json /libraries

# Copy the bin directory to the /libraries directory
RUN cp -r /tmp/source_code/bin /libraries

# Remove everything inside /tmp
RUN rm -rf /tmp/*

FROM node:18-alpine

# Install necessary packages
RUN apk add --no-cache bash git chromium

# Copy the libraries directory from the build stage
COPY --from=build /libraries /libraries

# Environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create a non-root user
RUN addgroup -S myuser && adduser -S myuser -G myuser

# Create a script that runs the desired command
RUN echo -e "#!/bin/bash\n/libraries/bin/run_bin" > /usr/local/bin/asyncapi

# Make the script executable
RUN chmod +x /usr/local/bin/asyncapi

# Change ownership to non-root user
RUN chown -R myuser:myuser /libraries /usr/local/bin/asyncapi || echo "Failed to change ownership"

# Copy the entrypoint script
COPY github-action/entrypoint.sh /entrypoint.sh

# Copy github-action folder
COPY github-action /github-action

# Make the entrypoint script executable
RUN chmod +x /entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]
