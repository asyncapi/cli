# Migrating `@asyncapi/optimizer` into the CLI (and the v2 release)

> A plain-language guide for anyone new to this codebase. It explains what moved, why, and what (if anything)
> you need to change as a consumer. For the precise package reference, see [`docs/optimizer/spec.md`](/docs/optimizer/spec.md).

## What changed, in one paragraph

`@asyncapi/optimizer` used to live in its own repository (`asyncapi/optimizer`). Its source now lives inside the
AsyncAPI CLI repository under [`packages/optimizer/`](/packages/optimizer). The CLI became a small **monorepo**
so the library can be developed and released next to the CLI that uses it. The npm package name is unchanged
(`@asyncapi/optimizer`), and the `asyncapi optimize` command works exactly as before. Alongside the move we
also shipped **optimizer v2**, a deliberate breaking change for people who use the library directly from npm.

## Key concepts (quick)

- **Monorepo** — one git repo containing multiple publishable packages (here: root `@asyncapi/cli` plus
  `packages/optimizer`).
- **npm workspaces** — the feature that symlinks local packages together, so the CLI's
  `"@asyncapi/optimizer": "*"` resolves to `packages/optimizer/` on disk instead of downloading from npm.
- **Turborepo (`turbo`)** — orders builds/tests across packages (builds the optimizer before the CLI that
  imports it).
- **peerDependency** — a dependency the consumer must install themselves. In v2, `@asyncapi/parser` is a peer of
  the optimizer (the CLI already provides it).
- **Changesets** — how both packages get versioned, changelogged, and published from this repo.

## Does this affect me?

- **If you use the `asyncapi optimize` CLI command:** No change. Same command, flags, and behaviour.
- **If you install `@asyncapi/optimizer` from npm directly:** Yes — v2 is breaking. See below.

## v2 breaking changes for direct library consumers

1. **Typed, coded errors.** The library used to throw plain `Error` (and `console.error` the parser
   diagnostics). It now throws typed subclasses of `OptimizerError`, each with a stable `.code`
   (`OptimizerErrorCode`), and attaches diagnostics to `error.details` instead of printing them.

   ```ts
   import { OptimizerError, OptimizerErrorCode } from '@asyncapi/optimizer';

   try {
     const report = await optimizer.getReport();
   } catch (err) {
     if (err instanceof OptimizerError && err.code === OptimizerErrorCode.DOCUMENT_PARSE_FAILED) {
       console.error('Could not parse:', err.details);
     }
   }
   ```

2. **`getReport()` return shape.** It now returns an array of groups instead of an object keyed by
   optimization name:

   ```ts
   // v1
   const report = await optimizer.getReport();
   report.removeComponents; // ReportElement[] | undefined

   // v2
   const report = await optimizer.getReport(); // { type, elements }[]
   report.find((g) => g.type === 'removeComponents')?.elements ?? [];
   ```

3. **`@asyncapi/parser` is now a peerDependency.** Make sure your project installs it:

   ```bash
   npm install @asyncapi/optimizer @asyncapi/parser
   ```

**Unchanged in v2:** the optimization algorithm and its output, the `Optimizer` class + constructor, and
`getOptimizedDocument(options)`.

## How releases work now

Both packages publish from this repo via Changesets:

1. A PR changes code and includes a `.changeset/*.md` entry describing the bump.
2. After merge, a bot opens a **"Version Packages"** PR that applies version bumps + changelogs.
3. Merging that PR runs `changeset publish`, which publishes each changed package to npm (with provenance).

`@asyncapi/optimizer` is registered as a Trusted Publisher on npm for `asyncapi/cli`, so it can be published
from here.

## For maintainers: working on the optimizer locally

```bash
npm install                 # links the workspace
npm run optimizer:build     # build just the optimizer
npm run optimizer:test      # test just the optimizer
npm run build               # full CLI build (builds optimizer first)
```

## References

- Package spec: [`docs/optimizer/spec.md`](/docs/optimizer/spec.md)
- Tracking issue: [optimizer#306](https://github.com/asyncapi/optimizer/issues/306)
- Prior art (same pattern): `@asyncapi/openapi-schema-parser` into `asyncapi/parser-js`
