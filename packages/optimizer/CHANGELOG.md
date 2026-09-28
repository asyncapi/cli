# @asyncapi/optimizer

## 2.0.0

### Major Changes

- cce4855: Migrate `@asyncapi/optimizer` into the AsyncAPI CLI monorepo (`packages/optimizer/`) and release it as **v2**.

  Breaking for direct library consumers: errors are now typed classes with a stable `.code`
  (`OptimizerError` + subclasses / `OptimizerErrorCode`) instead of plain `Error` + `console.error`;
  `getReport()` now returns `{ type, elements }[]`; `@asyncapi/parser` is now a `peerDependency`. The
  optimization algorithm and `getOptimizedDocument()` behaviour are unchanged.

  The `asyncapi optimize` command consumes the v2 `Report[]` shape. CLI user-facing flags and output
  are unchanged.

This changelog is managed by [Changesets](https://github.com/changesets/changesets). Entries below this
heading are generated automatically when a release is versioned from the `asyncapi/cli` monorepo.

The full history prior to the monorepo migration (versions up to `1.0.4`) lives in the standalone repository:
https://github.com/asyncapi/optimizer/releases
