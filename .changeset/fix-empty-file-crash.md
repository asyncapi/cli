---
"@asyncapi/cli": patch
---

fix: handle empty AsyncAPI files gracefully

When an empty file is provided, the CLI now throws a clear ErrorLoadingSpec error instead of crashing with a raw TypeError.
