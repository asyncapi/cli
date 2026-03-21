---
"@asyncapi/cli": patch
---

fix: suppress anonymous metrics submission after fatal generation errors

When a fatal error occurred (e.g. non-empty output directory), the CLI
attempted to flush metrics and printed an unrelated
"Skipping submitting anonymous metrics due to …" error to stdout,
polluting the output. Metrics are now skipped entirely when the command
exits with an error. Fixes #2010.
