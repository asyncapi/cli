---
"@asyncapi/optimizer": major
"@asyncapi/cli": minor
---

Migrate `@asyncapi/optimizer` into the AsyncAPI CLI monorepo (`packages/optimizer/`) and release it as **v2**.

Breaking for direct library consumers: errors are now typed classes with a stable `.code`
(`OptimizerError` + subclasses / `OptimizerErrorCode`) instead of plain `Error` + `console.error`;
`getReport()` now returns `{ type, elements }[]`; `@asyncapi/parser` is now a `peerDependency`. The
optimization algorithm and `getOptimizedDocument()` behaviour are unchanged.

The `asyncapi optimize` command consumes the v2 `Report[]` shape. CLI user-facing flags and output
are unchanged.
