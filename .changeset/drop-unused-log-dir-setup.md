---
"@asyncapi/cli": patch
---

Remove the leftover file-logging setup from the logger utility. The logger has no file transport, but the unused `config` import and `logDir`/`mkdirSync` block made every CLI command print four `node-config` warnings on startup since v3.3.0, and the `mkdirSync` call could race when several CLI processes start at once.
