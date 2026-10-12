# Spec: `@asyncapi/diff`

> npm: [`@asyncapi/diff`](https://www.npmjs.com/package/@asyncapi/diff)
> Source: [`packages/diff/`](/packages/diff)

This document describes what the package is, what problem it solves, how it works, and how to develop and
release it inside the `asyncapi/cli` monorepo. Install and usage examples live in
[`packages/diff/README.md`](/packages/diff/README.md).

---

## 1. Purpose

`@asyncapi/diff` is a **library** that compares two AsyncAPI documents and labels each change as
`breaking`, `non-breaking`, or `unclassified`.

It can format that result as JSON, YAML, or Markdown. It is **not** a CLI (no `bin`). The in-repo
consumers are the `asyncapi diff` command and the server-api `POST /v1/diff` endpoint.

## 2. Problem it solves

People need a stable answer to "what changed between these two AsyncAPI documents, and which of those
changes can break consumers?" The library applies a built-in rule table (AsyncAPI 2.x and 3.x) and lets
the caller override individual JSON Pointers.

```
parsed document A + parsed document B
        │  diff(a, b, { override, outputType })
        ▼
  AsyncAPIDiff
        ├── breaking()
        ├── nonBreaking()
        ├── unclassified()
        └── getOutput()
```

The caller must pass **valid, dereferenced** documents. This package does not parse files.

## 3. Public API

```ts
import { diff, AsyncAPIDiff, DiffVersionMismatchError, DiffErrorCode } from '@asyncapi/diff';

const output = diff(firstDocument, secondDocument, {
  override: {
    '/info/version': { add: 'breaking', remove: 'breaking', edit: 'non-breaking' },
  },
  outputType: 'json', // json | yaml | yml | markdown | md
});

output.breaking();
output.nonBreaking();
output.unclassified();
output.getOutput();
```

| Member | Role |
|--------|------|
| `diff(first, second, config?)` | Compare two documents. Returns `AsyncAPIDiff`. |
| `AsyncAPIDiff#breaking()` | Changes classified breaking. |
| `AsyncAPIDiff#nonBreaking()` | Changes classified non-breaking. |
| `AsyncAPIDiff#unclassified()` | Changes with no rule. |
| `AsyncAPIDiff#getOutput()` | The full result, in the requested format. |
| `config.override` | Per-pointer `add` / `remove` / `edit` classifications. |
| `config.outputType` | `json` (default), `yaml`, `yml`, `markdown`, or `md`. |
| `config.markdownSubtype` | How a markdown body is written: `json`, `yaml`, or `yml`. |

`AsyncAPIDiff` is also still available as the default export of `@asyncapi/diff/lib/asyncapidiff`. New code
should import it from `@asyncapi/diff`.

### Errors

Both errors extend `TypeError` and keep the historical messages. They also set `.code`.

| Class | `code` | Message |
|-------|--------|---------|
| `DiffVersionMismatchError` | `DIFF_VERSION_MISMATCH` | `diff between different AsyncAPI version is not allowed` |
| `DiffOverrideInvalidError` | `DIFF_OVERRIDE_INVALID` | `Override data must be an object` |

`error.name` stays `TypeError`, so the CLI still prints `TypeError: ...`. `instanceof DiffVersionMismatchError` and `.code` identify the case.

The library does not call `process.exit` and does not print to the console. Finding breaking changes is a
successful result. The CLI command decides whether that result fails the process (`DiffBreakingChangeError`,
unless `--no-error`).

An override is applied to a **copy** of the built-in rule table. It does not change the next `diff()` call
in the same process.

## 4. Output formats

| `outputType` | Result of `getOutput()` / `breaking()` / … |
|--------------|-----------------------------------------------|
| `json` (default) | Objects / arrays |
| `yaml` or `yml` | YAML string |
| `markdown` or `md` | Markdown string. `markdownSubtype` selects JSON or YAML inside the markdown. |

## 5. How it works

| File | Role |
|------|------|
| `src/index.ts` | Public exports, including `AsyncAPIDiff` and the error classes. |
| `src/main.ts` | `diff()`. Rejects mixed major versions, applies overrides, classifies changes. |
| `src/standard.ts` | Picks the v2 or v3 rule table and returns a deep copy. |
| `src/standards/v2.ts`, `src/standards/v3.ts` | Built-in breaking / non-breaking rules. |
| `src/mergeStandard.ts` | Copies caller overrides onto that call's rule table. |
| `src/generateDiff.ts` | `fast-json-patch` compare, then path formatting. |
| `src/categorizeChanges.ts` | Labels each change from the rule table. |
| `src/asyncapidiff.ts` | Filters and formats the result. |
| `src/errors.ts` | `DiffVersionMismatchError`, `DiffOverrideInvalidError`, `DiffErrorCode`. |

Runtime dependencies: `fast-json-patch`, `js-yaml`, `json2md`. `@asyncapi/parser` is a **devDependency**
used by tests only.

## 6. Package layout in the monorepo

```
packages/diff/
├── src/
├── test/
├── package.json
├── tsconfig.json
├── jest.config.js
├── README.md
├── standard-format.md
└── LICENSE
```

Published npm files: `/lib`, `README.md`, `LICENSE`. The build is CommonJS (`tsc` → `lib/`). There is no
`package-lock.json` in this folder. The monorepo has one lockfile at the repo root. There is no `"exports"`
map, so the historical deep import keeps resolving.

## 7. Build, test, lint (local)

From the repo root:

```bash
npm install
npm run diff:build    # turbo run build --filter=@asyncapi/diff
npm run diff:test     # turbo run test  --filter=@asyncapi/diff
npm test              # optimizer Jest + diff Jest + CLI Mocha + GitHub Action tests
```

Root `build` runs `diff:build` before the CLI TypeScript compile, because `asyncapi diff` and the API
controller import this package. Do not use unfiltered `turbo run test`: workspaces include `"."`, so that
would recurse into the root `test` script.

The package keeps Jest. The CLI's own tests stay Mocha. Root ESLint ignores `packages/diff/**`, same as
`packages/optimizer/**`.

## 8. Releases (Changesets)

Published from `asyncapi/cli`. Version stays at the last npm release (`0.5.0`) until a Changesets version
pull request bumps it. This migration's changeset is a **minor** (new export and coded errors, same
messages and `TypeError` compatibility), so the next publish is `0.6.0`.

1. `npx changeset` and select `@asyncapi/diff` (and `@asyncapi/cli` when the command or docs change).
2. On merge, Changesets opens a Version Packages pull request.
3. Merging that pull request runs `changeset publish`, then creates a GitHub Release named
   `@asyncapi/diff@<version>` for packages under `packages/` that were published in that run.
   `@asyncapi/cli` itself keeps the `vX.Y.Z` release.

`@asyncapi/diff` must have an npm trusted publisher for repository `asyncapi/cli` and workflow
`release-with-changesets.yml`.

## 9. What this package does NOT do

- It does not parse, validate, or dereference AsyncAPI documents.
- It does not exit the process when it finds breaking changes.
- It does not implement the CLI JSON envelope or numeric exit codes. Those belong to the CLI command.

## 10. History

`@asyncapi/diff` was previously published from the standalone `asyncapi/diff` repository. The source now lives in this monorepo at `packages/diff`.

## 11. Glossary

| Term | Meaning |
|------|---------|
| Breaking change | A change the rule table marks as unsafe for existing consumers. |
| Override | A caller-supplied classification for one JSON Pointer. |
| Rule table | The built-in v2 or v3 map of pointer → add/remove/edit classification. |
| Changesets | The monorepo versioning, changelog, and publish workflow. |

## 12. Quick links

| Resource | Path |
|----------|------|
| Source | [`packages/diff/src/`](/packages/diff/src) |
| Tests | [`packages/diff/test/`](/packages/diff/test) |
| npm README | [`packages/diff/README.md`](/packages/diff/README.md) |
| Rule-table format | [`packages/diff/standard-format.md`](/packages/diff/standard-format.md) |
| CLI command | [`src/apps/cli/commands/diff.ts`](/src/apps/cli/commands/diff.ts) |
| Release workflow | [`.github/workflows/release-with-changesets.yml`](/.github/workflows/release-with-changesets.yml) |
