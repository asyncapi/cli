FROM node:18-alpine

# Create a non-root user
RUN addgroup -S myuser && adduser -S myuser -G myuser

RUN apk add --no-cache bash>5.1.16 git>2.42.0 chromium

# Environment variables for Puppeteer for PDF generation by HTML Template
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Installing latest released npm package
RUN npm install --ignore-scripts -g @asyncapi/cli

COPY entrypoint.sh /entrypoint.sh

# Make the bash file executable
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]