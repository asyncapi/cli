---
"@asyncapi/cli": patch
---

fix: resolve external $ref files relative to spec file location

When the CLI was refactored to use GeneratorService, the `path` option passed to `generator.generateFromString()` was accidentally changed from a string file path to a Specification object. This caused relative `$ref` paths to be resolved against CWD instead of the spec file's directory.

This fix passes `asyncapi.getSource()` (which returns the file path string or URL) instead of the Specification object, restoring the correct behavior for resolving external file references.