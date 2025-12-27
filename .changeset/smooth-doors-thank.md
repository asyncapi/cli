---
'@asyncapi/cli': patch
---

fix: remove unnecessary await from startPreview call

The startPreview function returns void, not a Promise, so awaiting it
was incorrect and triggered a linter error. This matches the pattern
used in the studio command.
