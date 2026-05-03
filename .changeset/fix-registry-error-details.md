---
"@asyncapi/cli": patch
---

fix: preserve error chain in registry validation

When registry validation fails, the original error is now preserved as the cause property, making it easier to debug network, DNS, SSL, and proxy issues.
