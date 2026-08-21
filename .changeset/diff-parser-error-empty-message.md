---
'@asyncapi/cli': patch
---

Fix `asyncapi diff` printing a bare `ValidationError:` with no diagnostic body
when one of the supplied documents fails to parse. The parse-failure branch in
`parseDocuments` used the `'invalid-file'` ValidationError type (the file-not-
found template) instead of `'parser-error'`, and `buildError` produced an
empty string for non-ParserError error shapes such as plain strings or generic
`Error` objects. Both paths now surface a meaningful, non-empty message.
