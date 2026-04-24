---
"@asyncapi/cli": patch
---

fix: skip request body validation gracefully when no schema defined, support slash-based branch names in GitHub URLs, and use path.extname() for reliable file extension detection

Fixes #1987 and #1940.
