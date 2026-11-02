[![AsyncAPI Bundler](./assets/logo.png)](https://www.asyncapi.com)

[![Github license](https://img.shields.io/github/license/asyncapi/cli)](https://github.com/asyncapi/cli/blob/master/packages/bundler/LICENSE)
[![PR testing - if Node project](https://github.com/asyncapi/cli/actions/workflows/if-nodejs-pr-testing.yml/badge.svg)](https://github.com/asyncapi/cli/actions/workflows/if-nodejs-pr-testing.yml)
[![npm](https://img.shields.io/npm/dw/@asyncapi/bundler)](https://www.npmjs.com/package/@asyncapi/bundler)

This package is developed in the [AsyncAPI CLI monorepo](https://github.com/asyncapi/cli/tree/master/packages/bundler).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
  - [Dereference of the external references](#dereference-of-the-external-references)
  - [Option `baseDir`](#option-basedir)
  - [Property `x-origin`](#property-x-origin)
  - [Movement of components to `components`](#movement-of-components-to-components)
  - [Code examples](#code-examples)
- [bundle(files, [options])](#bundlefiles-options)
- [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview
An official library that lets you bundle/dereference or merge into one your AsyncAPI Documents.

AsyncAPI Bundler can help you if:

<details>
<summary>your specification file is divided into different smaller files and is using JSON `$ref` property to reference components </summary>

```yaml

# asyncapi.yaml
asyncapi: '2.4.0'
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signups
channels:
  user/signup:
    subscribe:
      message:
        $ref: './messages.yaml#/messages/UserSignedUp'

# messages.yaml
messages:
  UserSignedUp:
    payload:
      type: object
      properties:
        displayName:
          type: string
          description: Name of the user
        email:
          type: string
          format: email
          description: Email of the user

# After combining
asyncapi: 2.4.0
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signups
channels:
  user/signedup:
    subscribe:
      message:
        payload:
          type: object
          properties:
            displayName:
              type: string
              description: Name of the user
            email:
              type: string
              format: email
              description: Email of the user

```

</details>

<details>
<summary>you have different standalone specification files that define a larger system, see examples here </summary>

```yaml

# signup.yaml
asyncapi: '2.4.0'
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user Signup

channels:
  user/signedup:
    subscribe:
      message:
        payload:
          type: object
          properties:
            displayName:
              type: string
            email:
              type: string
              format: email


# login.yaml
asyncapi: '2.4.0'
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signup

channels:
  user/loggenin:
    subscribe:
      message:
        payload:
          type: object
          properties:
            displayName:
              type: string

# After combining
# asyncapi.yaml
asyncapi: '2.4.0'
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge for processing user authentication

channles:
  user/signedup:
    subscribe:
      message:
        payload:
          type: object
          properties:
            displayName:
              type: string
            email:
              type: string
              format: email
  user/loggedin:
    subscribe:
      message:
        payload:
          type: object
          properties:
            displayName:
              type: string
```

</details>

<br>

## Installation

```
npm install @asyncapi/bundler
```

## Usage

AsyncAPI Bundler can be easily used within your JavaScript projects as a Node.js module:

```js
'use strict';

const { writeFileSync } = require('fs');
const bundle = require('@asyncapi/bundler');

async function main() {
  const document = await bundle(['social-media/comments-service/main.yaml'], {
    baseDir: 'example-data',
    xOrigin: true,
  });
  if (document.yml()) {
    console.log(document.yml()); // the complete bundled AsyncAPI document
    writeFileSync('asyncapi.yaml', document.yml()); // the complete bundled AsyncAPI document
  }
}

main().catch(e => console.error(e));
```

### Dereference of the external references

`Bundler` dereferences the provided AsyncAPI Document to the maximum possible extent, leaving intact only those internal references that MUST be `Reference Object`s according to the AsyncAPI Specification (thus, should never be dereferenced):

- AsyncAPI Specification v2.6.0
  
There are no internal references that MUST be `Reference Object`s.

- AsyncAPI Specification v3.0.0

Regexes of internal references that MUST be `Reference Object`s:

```
/#\/channels\/.*\/servers/
/#\/operations\/.*\/channel/
/#\/operations\/.*\/messages/
/#\/operations\/.*\/reply\/channel/
/#\/operations\/.*\/reply\/messages/
/#\/components\/channels\/.*\/servers/
/#\/components\/operations\/.*\/channel/
/#\/components\/operations\/.*\/messages/
/#\/components\/operations\/.*\/reply\/channel/
/#\/components\/operations\/.*\/reply\/messages/
```


### Option `baseDir`

Option `baseDir` represents the main working directory of the program, "root directory," relatively to which will be resolved all paths of AsyncAPI Documents passed to the `Bundler`.

Starting from `Bundler` v0.5.0, option `baseDir` is reimplemented with changed logic, and `Bundler` accepts only **paths** of AsyncAPI Documents, which will be read with `readFileSync()` internally.

In a nutshell, the process looks like this:

- Paths of AsyncAPI Documents are passed as `'main.yaml'` | `'./main.yaml'` | `'../main.yaml'` | `['./main.yaml']` | `['main.yaml', 'audio.yaml']`, etc.

- Path/paths are assured to have an `Array` type with `Array.from()` to make them iterable.

- Working directory of the program is changed to the `baseDir` with `process.chdir()`.

- **And only then** are the paths of the AsyncAPI Documents starting to be read from the array the are currently in, one by one, resolving paths and `$ref`s relatively to the `baseDir`.

Take a look at `./example/bundle-cjs.cjs`, which demonstrates working with `baseDir` and `$ref`s of different levels of nesting.


### Property `x-origin`

Property `x-origin` is used for origin tracing in `Bundler` and component naming in `Optimizer`.

It originated from [this comment](https://github.com/asyncapi/bundler/issues/97#issuecomment-1330501758) in a year-long discussion: 

> The $ref usually also carries a semantical meaning to understand easier what it is (example "$ref : financial-system.yaml#/components/schemas/bankAccountIdentifier"). If the bundling just resolves this ref inline, the semantical meaning of the $ref pointer gets lost and cannot be recovered in later steps. The optimizer would need to invent an artificial component name for the "bankAccountIdentifier" when moving it to the components section.

Thus, property `x-origin` contains historical values of dereferenced `$ref`s, which are also used by `Optimizer` to give meaningful names to components it moves through the AsyncAPI Document.

However, if a user doesn't need / doesn't want `x-origin` properties to be present in the structure of the AsyncAPI Document (values of the `x-origin` property may leak internal details about how the system described by the AsyncAPI Document is structured,) they can pass `{ xOrigin: false }` (or omit passing `xOrigin` at all) to the `Bundler` in the options object.


### Movement of components to `components`

The movement of all AsyncAPI Specification-valid components to the `components` section of the AsyncAPI Document starting from `Bundler` v0.5.0 is done by the [`Optimizer`](https://github.com/asyncapi/optimizer) v1.0.0+.

To get in CI/code an AsyncAPI Document, that is dereferenced [to its maximum possible extent](#dereference-of-the-external-references) with all of its components moved to the `components` section, the original AsyncAPI Document must be run through chain `Bundler -> Optimizer`.

If `Optimizer` is not able to find `x-origin` properties during optimization of the provided AsyncAPI Document, the existing names of components are used as a fallback mechanism, but keep in mind that components' names may lack semantic meaning in this case.


### Code examples

**TypeScript**
```ts
import { writeFileSync } from 'fs';
import bundle from '@asyncapi/bundler';

async function main() {
  const document = await bundle(['social-media/comments-service/main.yaml'], {
    baseDir: 'example-data',
    xOrigin: true,
  });
  if (document.yml()) {
    writeFileSync('asyncapi.yaml', document.yml());
  }

main().catch(e => console.error(e));
```

**JavaScript CJS module system**
```js
'use strict';

const { writeFileSync } = require('fs');
const bundle = require('@asyncapi/bundler');

async function main() {
  const document = await bundle(['social-media/comments-service/main.yaml'], {
    baseDir: 'example-data',
    xOrigin: true,
  });
  if (document.yml()) {
    writeFileSync('asyncapi.yaml', document.yml());
  }

main().catch(e => console.error(e));
```

**JavaScript ESM module system**
```js
'use strict';

import { writeFileSync } from 'fs';
import bundle from '@asyncapi/bundler';

async function main() {
  const document = await bundle(['social-media/comments-service/main.yaml'], {
    baseDir: 'example-data',
    xOrigin: true,
  });
  if (document.yml()) {
    writeFileSync('asyncapi.yaml', document.yml());
  }

main().catch(e => console.error(e)); 

```


<a name="bundle"></a>

## bundle(files, [options])
**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| files | <code>string</code> \| <code>Array.&lt;string&gt;</code> | <p>One or more relative/absolute paths to AsyncAPI Documents that should be bundled.</p> |
| [options] | <code>Object</code> |  |
| [options.base] | <code>string</code> | <p>One relative/absolute path to base object whose properties will be retained.</p> |
| [options.baseDir] | <code>string</code> | <p>One relative/absolute path to directory relative to which paths to AsyncAPI Documents that should be bundled will be resolved.</p> |
| [options.xOrigin] | <code>boolean</code> | <p>Pass <code>true</code> to generate properties <code>x-origin</code> that will contain historical values of dereferenced <code>$ref</code>s.</p> |


## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="25%"><a href="https://github.com/Souvikns"><img src="https://avatars.githubusercontent.com/u/41781438?v=4?s=100" width="100px;" alt="souvik"/><br /><sub><b>souvik</b></sub></a><br /><a href="https://github.com/asyncapi/bundler/commits?author=Souvikns" title="Code">💻</a> <a href="#ideas-Souvikns" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-Souvikns" title="Design">🎨</a> <a href="https://github.com/asyncapi/bundler/pulls?q=is%3Apr+reviewed-by%3ASouvikns" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-Souvikns" title="Maintenance">🚧</a> <a href="https://github.com/asyncapi/bundler/commits?author=Souvikns" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="25%"><a href="https://github.com/magicmatatjahu"><img src="https://avatars.githubusercontent.com/u/20404945?v=4?s=100" width="100px;" alt="Maciej Urbańczyk"/><br /><sub><b>Maciej Urbańczyk</b></sub></a><br /><a href="#ideas-magicmatatjahu" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/asyncapi/bundler/pulls?q=is%3Apr+reviewed-by%3Amagicmatatjahu" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="25%"><a href="https://github.com/toukirkhan"><img src="https://avatars.githubusercontent.com/u/88899011?v=4?s=100" width="100px;" alt="Mohd Toukir Khan"/><br /><sub><b>Mohd Toukir Khan</b></sub></a><br /><a href="#infra-toukirkhan" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="25%"><a href="https://github.com/MrYugs"><img src="https://avatars.githubusercontent.com/u/5838714?v=4?s=100" width="100px;" alt="MrYugs"/><br /><sub><b>MrYugs</b></sub></a><br /><a href="https://github.com/asyncapi/bundler/commits?author=MrYugs" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="25%"><a href="https://github.com/amanbedi1"><img src="https://avatars.githubusercontent.com/u/82234871?v=4?s=100" width="100px;" alt="Amanpreet Singh Bedi"/><br /><sub><b>Amanpreet Singh Bedi</b></sub></a><br /><a href="https://github.com/asyncapi/bundler/commits?author=amanbedi1" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="25%"><a href="https://github.com/hillariter"><img src="https://avatars.githubusercontent.com/u/7823186?v=4?s=100" width="100px;" alt="Alexey Vasilevich"/><br /><sub><b>Alexey Vasilevich</b></sub></a><br /><a href="https://github.com/asyncapi/bundler/commits?author=hillariter" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="25%"><a href="https://github.com/aeworxet"><img src="https://avatars.githubusercontent.com/u/16149591?v=4?s=100" width="100px;" alt="Viacheslav Turovskyi"/><br /><sub><b>Viacheslav Turovskyi</b></sub></a><br /><a href="https://github.com/asyncapi/bundler/commits?author=aeworxet" title="Code">💻</a> <a href="#infra-aeworxet" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/asyncapi/bundler/commits?author=aeworxet" title="Documentation">📖</a> <a href="#maintenance-aeworxet" title="Maintenance">🚧</a> <a href="https://github.com/asyncapi/bundler/pulls?q=is%3Apr+reviewed-by%3Aaeworxet" title="Reviewed Pull Requests">👀</a> <a href="#ideas-aeworxet" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="25%"><a href="https://www.brainfart.dev/"><img src="https://avatars.githubusercontent.com/u/6995927?s=400&amp;u=70200e882bc86db94917031d3ced1e805ebe07ab&amp;v=4?s=100" width="100px;" alt="Lukasz Gornicki"/><br /><sub><b>Lukasz Gornicki</b></sub></a><br /><a href="#infra-derberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/asyncapi/bundler/pulls?q=is%3Apr+reviewed-by%3Aderberg" title="Reviewed Pull Requests">👀</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="25%"><a href="https://akshatnema.netlify.app"><img src="https://avatars.githubusercontent.com/u/76521428?v=4?s=100" width="100px;" alt="Akshat Nema"/><br /><sub><b>Akshat Nema</b></sub></a><br /><a href="https://github.com/asyncapi/bundler/commits?author=akshatnema" title="Code">💻</a></td>
      <td align="center" valign="top" width="25%"><a href="https://github.com/sambhavgupta0705"><img src="https://avatars.githubusercontent.com/u/81870866?v=4?s=100" width="100px;" alt="sambhavgupta0705"/><br /><sub><b>sambhavgupta0705</b></sub></a><br /><a href="https://github.com/asyncapi/bundler/commits?author=sambhavgupta0705" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
