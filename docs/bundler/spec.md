# Spec: `@asyncapi/bundler`

> npm: [`@asyncapi/bundler`](https://www.npmjs.com/package/@asyncapi/bundler)
> Source: [`packages/bundler/`](/packages/bundler)

This document describes the package, how the CLI uses it, and how to develop and release it inside the `asyncapi/cli` monorepo. Install and usage examples live in [`packages/bundler/README.md`](/packages/bundler/README.md).

## 1. What it is

`@asyncapi/bundler` is a library that reads one or more AsyncAPI documents, resolves external `$ref`s, and returns one document.

```ts
import bundle, { Document } from '@asyncapi/bundler';

const document: Document = await bundle(['main.yaml'], {
  base: 'base.yaml',
  baseDir: 'specs',
  xOrigin: true,
});

document.json();
document.yml();
document.string();
```

`Document` is also still available from `@asyncapi/bundler/lib/document`. New code should import it from `@asyncapi/bundler`.

## 2. Callers in this repo

| Caller | Role |
|---|---|
| `asyncapi bundle` | Writes the bundled document to stdout or `--output`. |
| `asyncapi start preview` | Bundles the file before Studio. |
| `POST /bundle` | Returns `{ bundled }`. A thrown error stays HTTP 500. |

## 3. Errors

The library does not call `process.exit`. Messages and `error.name` stay as they were. Each error also has `.code` for the CLI mapper in the logging work.

| Case | `error.name` | `.code` | Message |
|---|---|---|---|
| Empty input | `null-or-falsy-document` | `BUNDLER_INPUT_INVALID` | `Document can't be null or falsey.` |
| Wrong input type | `invalid-document-type` | `BUNDLER_INPUT_INVALID` | `The AsyncAPI document has to be either a string or a JS object.` |
| Invalid YAML | `invalid-yaml` | `BUNDLER_DOCUMENT_PARSE_FAILED` | `The provided yaml is not valid.` |
| Mixed major versions | `Error` | `BUNDLER_VERSION_MISMATCH` | `Unable to bundle specification files of different major versions` |
| Base file version differs | `Error` | `BUNDLER_VERSION_MISMATCH` | `Base file has different major version than other specification files` |
| `$ref` cannot be resolved | the resolver's error name | `BUNDLER_REFERENCE_RESOLUTION_FAILED` | the resolver's message |

## 4. Develop

```text
npm run bundler:build
npm run bundler:test
```

The package keeps Jest, including the `@apidevtools/json-schema-ref-parser` transform. Root ESLint ignores `packages/bundler/**`.

## 5. Release

`@asyncapi/cli` tags stay `vX.Y.Z`. This package's tag is `@asyncapi/bundler@<version>`.

`prepublishOnly` runs `tsc` directly. It does not call `npm run`.

`@asyncapi/bundler` needs an npm trusted publisher for repository `asyncapi/cli` and workflow `release-with-changesets.yml`, with direct `npm publish` allowed.

The package was previously published from `asyncapi/bundler`. The source now lives at `packages/bundler`.
