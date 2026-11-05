---
'@asyncapi/cli': patch
---

Fix `asyncapi diff` printing a bare `ValidationError:` with no diagnostic body when one of the supplied documents fails to parse. The parse-failure branch in `parseDocuments` used the `invalid-file` ValidationError type (the file-not-found template) instead of `parser-error`, and `buildError` produced an empty string for error shapes that do not follow the ParserError contract, such as the plain string returned by the validation service or a wrapped ValidationError. Both paths now surface a non-empty message.
