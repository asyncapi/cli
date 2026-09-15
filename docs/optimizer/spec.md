# Spec: `@asyncapi/optimizer`

> npm: [`@asyncapi/optimizer`](https://www.npmjs.com/package/@asyncapi/optimizer)
> Source: [`packages/optimizer/`](/packages/optimizer)

This document describes what the package is, what problem it solves, how it works, how to develop and release
it inside the `asyncapi/cli` monorepo, and the v2 contract. Consumer-facing install/usage examples live in
[`packages/optimizer/README.md`](/packages/optimizer/README.md). A beginner-oriented migration walkthrough
lives in [`docs/optimizer-migration.md`](/docs/optimizer-migration.md).

---

## 1. Purpose

`@asyncapi/optimizer` is a **library** that analyzes an AsyncAPI document and reports (and optionally applies)
structural optimizations that make the document smaller and less repetitive:

- **remove** unused `components`,
- **reuse** existing `components` where the same object is duplicated,
- **move** duplicated objects into `components`,
- **move all** eligible objects into `components` and replace them with `$ref`s.

It is designed to be consumed by UIs and CLIs. The primary in-repo consumer is the `asyncapi optimize` command.
It is **not** a CLI itself (no `bin`).

## 2. Problem it solves

AsyncAPI documents frequently inline the same message/schema shapes in many places. The optimizer detects those
and rewrites the document to use the `components` section plus `$ref`s, without changing the document's meaning.

```
AsyncAPI YAML/JSON
      │  new Optimizer(text)
      ▼
  getReport()  ──►  Report[]  (what could be optimized, grouped by type)
      │  getOptimizedDocument({ rules, output, disableOptimizationFor })
      ▼
  optimized AsyncAPI document (YAML or JSON string)
```

## 3. Public API

### Factory / class

```ts
import { Optimizer, Output } from '@asyncapi/optimizer';

const optimizer = new Optimizer(yamlOrJsonOrObject);
const report = await optimizer.getReport();               // Report[]
const optimized = optimizer.getOptimizedDocument(options); // string (YAML or JSON)
```

| Member | Role |
|--------|------|
| `new Optimizer(YAMLorJSON)` | Construct from a YAML/JSON string or a plain object. |
| `getReport(): Promise<Report[]>` | Parses the document (via `@asyncapi/parser`) and returns per-type optimization groups. |
| `getOptimizedDocument(options?): string` | Applies the selected rules and returns the optimized document. Must be called after `getReport()`. |
| `Output` (enum) | `JSON` \| `YAML` — output format for `getOptimizedDocument`. |
| `Action` (enum) | `Move` \| `Remove` \| `Reuse` — the action on a `ReportElement`. |

### Types

```ts
interface ReportElement { path: string; action: Action; target?: string }
interface Report { type: string; elements: ReportElement[] }   // v2 shape
interface Options {
  rules?: { reuseComponents?: boolean; removeComponents?: boolean; moveAllToComponents?: boolean; moveDuplicatesToComponents?: boolean };
  output?: Output;
  disableOptimizationFor?: { schema?: boolean };
}
```

### Errors (v2)

All failures are typed subclasses of `OptimizerError`, each carrying a stable `code` (`OptimizerErrorCode`) and
optional `details`. The library never calls `process.exit` and never prints to the console.

| Class | `code` | Thrown when |
|-------|--------|-------------|
| `OptimizerInputError` | `OPTIMIZER_INPUT_INVALID` | Input is neither an object nor a YAML/JSON string. |
| `OptimizerParseError` | `OPTIMIZER_DOCUMENT_PARSE_FAILED` | `@asyncapi/parser` could not produce a document (`details` = diagnostics). |
| `OptimizerStateError` | `OPTIMIZER_REPORT_NOT_GENERATED` | `getOptimizedDocument()` called before `getReport()`. |
| `OptimizerSerializationError` | `OPTIMIZER_SERIALIZATION_FAILED` | The optimized document could not be serialized to JSON/YAML. |

Consumers can branch on `err instanceof OptimizerError` and/or `err.code`.

## 4. How the CLI maps optimizer errors to exit codes

Exit codes are a CLI-process concept and live in the CLI, not the library. The `asyncapi optimize` command maps
optimizer error codes onto the unified exit-code table in
[`codes_reference-cleanup-docs.md`](/codes_reference-cleanup-docs.md):

| `OptimizerErrorCode` | CLI exit code |
|----------------------|---------------|
| `OPTIMIZER_INPUT_INVALID` / `OPTIMIZER_DOCUMENT_PARSE_FAILED` | 10 (`DOCUMENT_SYNTAX_INVALID` / `DOCUMENT_PARSE_FAILED`) |
| `OPTIMIZER_SERIALIZATION_FAILED` | 36 (`FILE_SERIALIZATION_FAILED`) |
| `OPTIMIZER_REPORT_NOT_GENERATED` | 91 (`INTERNAL_STATE_ERROR`) |

No new CLI codes were required; see `optimizer-migration/v2-error-codes-mapping.md` in the working docs.

## 5. How it works (implementation)

| File | Role |
|------|------|
| `src/index.ts` | Public exports. |
| `src/Optimizer.ts` | `Optimizer` class, `Output`/`Action` enums, `getReport`/`getOptimizedDocument`/`applyReport`. |
| `src/ComponentProvider.ts` | Collects optimizable components from the parsed document. |
| `src/Reporters/*` | The four reporters (`removeComponents`, `reuseComponents`, `moveAllToComponents`, `moveDuplicatesToComponents`). |
| `src/Utils/Helpers.ts` | `toJS`, equality checks, report filtering/sorting. |
| `src/errors.ts` | `OptimizerError` hierarchy + `OptimizerErrorCode`. |
| `src/types.ts` | `Report`, `ReportElement`, `Options`, internal types. |

### Runtime dependencies

| Package | Role |
|---------|------|
| `js-yaml` | Parse/dump YAML. |
| `jsonpath-plus`, `lodash`, `merge-deep` | Traversal + document manipulation. |
| `debug` | Debug logging. |
| `@asyncapi/parser` | **peerDependency** — parses the document in `getReport()`. |

## 6. Package layout in the monorepo

```
packages/optimizer/
├── src/                 # TypeScript source (published as compiled lib/)
├── test/                # Jest tests + fixtures
├── package.json
├── tsconfig.json        # CJS build -> lib/
├── jest.config.js
├── README.md            # npm-facing install/usage
└── CHANGELOG.md         # managed with Changesets
```

Published npm files: `/lib`, `README.md`, `LICENSE` (`main`/`types` point at `lib/`). Build output is
**CommonJS only** (unchanged from v1).

## 7. Build, test, lint (local)

From the **repo root** (npm workspaces + Turborepo):

```bash
npm install
npm run optimizer:build   # turbo run build --filter=@asyncapi/optimizer
npm run optimizer:test    # turbo run test  --filter=@asyncapi/optimizer
```

Turbo builds `@asyncapi/optimizer` before the root CLI build, because the CLI's build compiles
`src/apps/cli/commands/optimize.ts`, which imports this package.

## 8. Releases (Changesets)

Published from **`asyncapi/cli`** (not the old standalone repo). The CLI stays at the **repo root**;
`package.json` workspaces are `[".", "packages/*"]` so Changesets still sees `@asyncapi/cli` (same
contributor flow as today) plus `@asyncapi/optimizer`.

1. Change code. For optimizer-only work, select `@asyncapi/optimizer`. For CLI work, select
   `@asyncapi/cli` (unchanged). A PR can name both.
2. `npx changeset` → choose the package(s), bump, write a summary; commit the `.changeset/*.md`.
3. On merge, the Changesets action opens/updates a **Version Packages** PR (`changeset version` +
   `bump:github-action`). That bumps each named package's `package.json` and CHANGELOG.
4. Merging that PR publishes changed packages to npm (`changeset publish`, with a root
   `npm publish --provenance` fallback) from `.github/workflows/release-with-changesets.yml`.

`@asyncapi/optimizer` must be registered as a **Trusted Publisher** on npm for `asyncapi/cli` before the first
publish. Package metadata: `private: false`, `publishConfig.access: public`.

## 9. What this package does NOT do

- It is not a full AsyncAPI validator (it relies on `@asyncapi/parser`).
- It does not call `process.exit` or print to the console (that is the CLI command's job).
- It does not change the `asyncapi optimize` command's UX.

## 10. History and v2

| When | What |
|------|------|
| Pre-migration | Maintained at [`asyncapi/optimizer`](https://github.com/asyncapi/optimizer) up to `1.0.4`; released via semantic-release. |
| Migration | Moved into `asyncapi/cli` under `packages/optimizer/` — tracking issue [optimizer#306](https://github.com/asyncapi/optimizer/issues/306). |
| v2 (this release) | Typed coded errors; `getReport()` -> `Report[]`; `@asyncapi/parser` -> peerDependency; unused `yaml` dep dropped. Algorithm unchanged. |

## 11. Glossary

| Term | Meaning |
|------|---------|
| Report | List of `{ type, elements }` groups describing possible optimizations. |
| Reporter | A function that produces one report group for one optimization type. |
| components | The AsyncAPI section where reusable objects live and are `$ref`-erenced. |
| peerDependency | A dependency the consumer must install (`@asyncapi/parser`). |
| Changesets | The monorepo versioning + changelog + publish workflow. |

## 12. Quick links

| Resource | Path |
|----------|------|
| Source | [`packages/optimizer/src/`](/packages/optimizer/src) |
| Tests | [`packages/optimizer/test/`](/packages/optimizer/test) |
| npm README | [`packages/optimizer/README.md`](/packages/optimizer/README.md) |
| Migration guide | [`docs/optimizer-migration.md`](/docs/optimizer-migration.md) |
| Exit-code convention | [`codes_reference-cleanup-docs.md`](/codes_reference-cleanup-docs.md) |
| Release workflow | [`.github/workflows/release-with-changesets.yml`](/.github/workflows/release-with-changesets.yml) |
| Tracking issue | https://github.com/asyncapi/optimizer/issues/306 |
