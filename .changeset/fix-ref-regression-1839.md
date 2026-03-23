---
"@asyncapi/cli": patch
---

fix: resolve external $ref files relative to spec file location (#1839)

Since v3.3.0, the `generate:fromTemplate` command failed to resolve external
`$ref` files when the AsyncAPI spec was located in a subdirectory. Relative
references like `./schemas.yaml` were incorrectly resolved against the current
working directory instead of the spec file's directory.

**Root cause:** When `GeneratorService` was introduced, the `path` option
passed to `generator.generateFromString()` was accidentally changed from a
string file path to a `Specification` object. The generator uses this `path`
to determine the base directory for resolving relative `$ref` paths. Receiving
an object instead of a string caused it to fall back to CWD.

**Fix:** Pass `asyncapi.getSource()` (which returns the file path string or
URL) instead of `asyncapi` (the Specification object). Also corrected the
`GeneratorRunOptions` interface to type `path` as `string` instead of
`Specification`.

Closes #1839
