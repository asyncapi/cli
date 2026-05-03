---
"@asyncapi/cli": patch
---

fix: detect multi-document YAML and show clear error message

When an AsyncAPI file contains multiple YAML documents (separated by ---), the CLI now throws a clear error instead of falling into an incorrect parsing code path.
