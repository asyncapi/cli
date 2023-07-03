ARG ASYNCAPI_CLI_VERSION=0.50.0

FROM node:16-alpine

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
    rm -rf /var/lib/apt/lists/* && \
    rm /var/cache/apk/*

# Installing latest released npm package
RUN npm install --ignore-scripts -g @asyncapi/cli@$ASYNCAPI_CLI_VERSION

# Switch to the non-root user
USER myuser

ENTRYPOINT [ "asyncapi" ]
