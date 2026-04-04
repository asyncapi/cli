FROM node:24-alpine AS build

RUN corepack enable && corepack prepare pnpm@9.15.5 --activate

# Copy the source code
COPY ./ /tmp/source_code

WORKDIR /tmp/source_code

# Install dependencies
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

# Set ARG to explicit value to build chosen version. Default is "latest"
ARG ASYNCAPI_CLI_VERSION=

# Create a non-root user
RUN addgroup -S myuser && adduser -S myuser -G myuser

WORKDIR /app

# Since 0.14.0 release of html-template chromium is needed for pdf generation
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# Since 0.30.0 release Git is supported and required as a dependency
# Since 0.14.0 release of html-template chromium is needed for pdf generation.
# More custom packages for specific template should not be added to this dockerfile. Instead, we should come up with some extensibility solution.
RUN apk --update add git chromium && \
    apk add --no-cache --virtual .gyp python3 make g++ && \
    rm -rf /var/lib/apt/lists/* && \
    rm /var/cache/apk/*

# Copy the libraries directory from the build stage
COPY --from=build /libraries /libraries

# Install the dependencies
RUN cd /libraries && pnpm install --frozen-lockfile --prod --ignore-scripts

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
