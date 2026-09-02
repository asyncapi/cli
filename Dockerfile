FROM node:24-alpine AS build

# Copy the source code
COPY ./ /tmp/source_code

# Install dependencies
RUN cd /tmp/source_code && npm install --ignore-scripts

# Build the source code
RUN cd /tmp/source_code && npm run build

# create libraries directory
RUN mkdir -p /libraries

# Copy the lib, bin, node_modules, and package.json files to the /libraries directory
RUN cp -r /tmp/source_code/lib /libraries
RUN cp -r /tmp/source_code/assets /libraries
RUN cp /tmp/source_code/package.json /libraries
RUN cp /tmp/source_code/package-lock.json /libraries
RUN cp /tmp/source_code/oclif.manifest.json /libraries

# Copy the bin directory to the /libraries directory
RUN cp -r /tmp/source_code/bin /libraries

# Remove everything inside /tmp
RUN rm -rf /tmp/*

FROM node:24-alpine

# Set ARG to explicit value to build chosen version. Default is "latest"
ARG ASYNCAPI_CLI_VERSION=

# Create a non-root user
RUN addgroup -S myuser && adduser -S myuser -G myuser

WORKDIR /app

# Since 0.14.0 release of html-template, chromium is needed for PDF generation.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# Since 0.30.0 release Git is supported and required as a dependency.
# NOTE: @asyncapi/studio is no longer a hard dependency of the CLI, so it is not
# present in this image (keeps it ~450MB smaller). `asyncapi start studio`,
# `start preview` and `new --studio` will offer to install Studio on-demand into
# the container's data directory (pass `--yes` or ASYNCAPI_STUDIO_AUTO_INSTALL=1
# in non-interactive contexts). Chromium is kept so that html-template PDF
# generation works out of the box.
# More custom packages for specific templates should not be added to this
# dockerfile. Instead, we should come up with some extensibility solution.
RUN apk --update add --no-cache git chromium && \
    rm -rf /var/cache/apk/*

# Copy the libraries directory from the build stage
COPY --from=build /libraries /libraries

# Install production dependencies, then deduplicate and clean the npm cache to
# reduce the final image size. @asyncapi/studio/next are not installed here
# because they are no longer runtime dependencies (installed on-demand instead).
RUN cd /libraries && \
    npm install --omit=dev --ignore-scripts && \
    npm dedupe && \
    npm cache clean --force

# Create a script that runs the desired command
RUN ln -s /libraries/bin/run_bin /usr/local/bin/asyncapi

# Make the script executable
RUN chmod +x /usr/local/bin/asyncapi

# Change ownership to non-root user
RUN chown -R myuser:myuser /libraries /usr/local/bin/asyncapi || echo "Failed to change ownership"

RUN chown -R myuser:myuser /usr/local/lib/node_modules && \
chown -R myuser:myuser /usr/local/bin

# Switch to the non-root user
USER myuser

ENTRYPOINT [ "asyncapi" ]
