---
"@asyncapi/cli": patch
---

fix: add timeout handling for registry URL validation to prevent CLI hang

- Added 5 second timeout using AbortController
- Changed from GET to HEAD request for lightweight validation
- Improved error messages for timeout and network errors
- Ensures CLI fails fast instead of hanging indefinitely

Fixes #2027