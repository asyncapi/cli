---
"@asyncapi/cli": patch
"@asyncapi/bundler": minor
---

Move `@asyncapi/bundler` into the CLI monorepo at `packages/bundler`. Export `Document` from the package entry and attach stable `BUNDLER_*` error codes without changing messages or `error.name`.
