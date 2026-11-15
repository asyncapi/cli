---
"@asyncapi/cli": patch
---

fix: keep the drive letter of a Windows folder in `--map-base-url <url>:<folder>`, so the URL is no longer cut at the colon after the drive letter.
