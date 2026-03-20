---
"@asyncapi/cli": patch
---

fix: prevent double-stringification of AsyncAPI document in archiver service

`appendAsyncAPIDocument` was calling `JSON.stringify()` unconditionally even when the input was already a string, resulting in escaped newlines and the entire YAML/JSON content being wrapped in double-quotes inside the generated ZIP. Now only objects are stringified; string inputs are written as-is.
