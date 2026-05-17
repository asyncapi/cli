---
"@asyncapi/cli": patch
---

fix: skip request body validation gracefully instead of throwing error

This commit fixes request body validation being skipped or reported as unsupported for certain paths or HTTP methods.

Two bugs were fixed:

1. Unsafe access to `requestBody.content['application/json'].schema` caused TypeError when application/json was not a content type (e.g., multipart/form-data, text/plain, or missing entirely).

2. When compileAjv() returned undefined (because the method has no requestBody, like GET/DELETE, or the requestBody has no JSON schema), the middleware incorrectly threw "Request body validation is not supported" error. This is wrong - methods without request bodies simply don't need body validation, and endpoints with non-JSON content types should silently skip rather than error.

Changes:
- Added `findContentSchema()` helper function that safely finds a schema from any content type, prioritizing application/json but falling back to any available schema
- Changed validation middleware to skip body validation (not throw error) when no schema is defined
- Added comprehensive tests for all edge cases

This ensures:
- Request body validation works for all paths/methods
- No false "unsupported" errors for endpoints without request bodies
- Invalid request bodies are properly validated when schema exists
- Non-JSON content types with schemas are properly supported
