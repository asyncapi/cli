---
"@asyncapi/cli": patch
---

fix(api): skip request body validation when the endpoint has no `body` parameter defined in its OpenAPI spec, avoiding spurious validation errors.
