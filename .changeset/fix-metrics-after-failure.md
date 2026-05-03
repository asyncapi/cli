---
"@asyncapi/cli": patch
---

fix: skip metrics submission after fatal generation failure

When a generation fails with a fatal error, the CLI was still attempting to submit anonymous metrics. Now metrics are only submitted when there's no error.
