---
'@asyncapi/cli': patch
---

fix: resolve $ref references correctly when asyncapi file is in subdirectory

Fixed issue #1839 where $ref references to local files would fail to resolve
when the asyncapi file was located in a subdirectory. The problem was caused
by passing a Specification object instead of a string file path to the
generator, which prevented the parser from setting the correct source path
for resolving relative references.

The fix changes `path: asyncapi` to `path: asyncapi.getFilePath()` in
generator.service.ts, ensuring the parser receives the correct file path
string for $ref resolution.