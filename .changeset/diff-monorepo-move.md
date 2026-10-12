---
"@asyncapi/cli": patch
"@asyncapi/diff": minor
---

Move `@asyncapi/diff` into this monorepo as `packages/diff`. The library now exports `AsyncAPIDiff` from the package entry and throws coded `TypeError` subclasses for a version mismatch and an invalid override, with the same messages as before. Overrides are applied to a copy of the rule table so one call cannot change the next call in the same process.
