FROM node:20-alpine

# Use below ARG in manual build of image to set version. Github workflow overrides in publication to Dockerhub 
ARG ASYNCAPI_CLI_VERSION=0.0.0 

# docker build -t cli:20 .  # to build image
# docker compose --file ./test/manual/docker-compose.yaml up # to launch container with running studio, note you need to add a random asyncapi.yaml to ./output folder

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

# Installing latest released npm package
RUN npm install --ignore-scripts -g @asyncapi/cli

# Switch to the non-root user
USER myuser

ENTRYPOINT [ "asyncapi" ]
