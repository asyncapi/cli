---
"@asyncapi/cli": patch
---

fix: add empty args definition to versions command

The versions command was missing the static args definition, which caused oclif to emit UnparsedCommand warnings during test runs.
