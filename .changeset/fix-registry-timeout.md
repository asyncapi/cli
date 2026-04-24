---
"@asyncapi/cli": patch
---

Fix bug where the CLI would hang indefinitely when the registry URL was unreachable. Added a 10s timeout and optimized validation using HEAD requests.
