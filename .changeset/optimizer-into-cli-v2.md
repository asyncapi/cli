---
"@asyncapi/optimizer": major
---

Migrate `@asyncapi/optimizer` into the AsyncAPI CLI monorepo (`packages/optimizer/`) and release it as **v2**.

Breaking for direct library consumers: errors are now typed classes with a stable `.code`
(`OptimizerError` + subclasses / `OptimizerErrorCode`) instead of plain `Error` + `console.error`;
`getReport()` now returns `{ type, elements }[]`; `@asyncapi/parser` is now a `peerDependency`. The
optimization algorithm and `getOptimizedDocument()` behaviour are unchanged.

(The root `@asyncapi/cli` is not managed by Changesets once workspaces are enabled — see
`optimizer-migration/rebase-after-merge.md` and the release notes for how the root package is published.)
