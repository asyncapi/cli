[![AsyncAPI Diff](/assets/logo.png)](https://www.asyncapi.com)

AsyncDiff is a library that compares two AsyncAPI files and provides information about the differences by pointing out explicitly information like breaking changes.

> **This package now lives in the [`asyncapi/cli`](https://github.com/asyncapi/cli) monorepo** under
> `packages/diff/` and is released from there (same npm name `@asyncapi/diff`).
> The comparison rules are unchanged. `AsyncAPIDiff` is exported from the package entry, and the two
> input errors are `TypeError` subclasses with a stable `.code`. See the spec:
> [`docs/diff/spec.md`](https://github.com/asyncapi/cli/blob/master/docs/diff/spec.md).

![npm](https://img.shields.io/npm/v/@asyncapi/diff?style=for-the-badge) ![npm](https://img.shields.io/npm/dt/@asyncapi/diff?style=for-the-badge)

<!-- toc is generated with GitHub Actions do not remove toc markers -->

<!-- toc -->

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Standard object](#standard-object)
  * [Overriding the standard](#overriding-the-standard)
- [Example](#example)
- [Output](#output)
- [API](#api)
- [Develop](#develop)
- [Contributing](#contributing)
- [Contributors](#contributors)

<!-- tocstop -->

## Features

- Get explicit information about the changes you make to your AsyncAPI files, such as breaking, non-breaking and unclassified changes.
- Different types of output such as JSON, YAML and Markdown.

## Installation

```
npm install @asyncapi/diff
```

## Usage

**NOTE:** The library doesn't have a built-in parser to parse the given AsyncAPI document. Thus, you have to make sure they provide the valid & dereferenced AsyncAPI document as an input. You can use the [AsyncAPI parser](https://github.com/asyncapi/parser-js) to parse and validate the AsyncAPI file first. You can use other tools, but you **must** make sure that the document is valid and dereferenced.

```js
import { diff } from "@asyncapi/diff"; // const { diff } = require('@asyncapi/diff');

const output = diff(firstDocument, secondDocument, {
  override: {
    // object to override the standard
  },
});
```

## Standard object

This library has a pre-configured standard which marks a change as `breaking`, `non-breaking` or `unclassified`. This standard data is stored as an object inside the [`standard.ts`](https://github.com/asyncapi/cli/blob/master/packages/diff/src/standard.ts) file.

The format of this standard object is explained in [this](standard-format.md) document.

### Overriding the standard

To understand the format of overriding object, take a look at [this](standard-format.md) document.

The overrides object must be passed in the following format:

```
{
	[jsonPointer]: {
		add: 'breaking' | 'non-breaking' | 'unclassified'
		remove: 'breaking' | 'non-breaking' | 'unclassified'
		edit: 'breaking' | 'non-breaking' | 'unclassified'
	}
}
```

## Example

See the [index](./docs/modules/index.md) document to get all the helper methods this library offers.

1. Without any overrides

```js
const output = diff(firstDocument, secondDocument);

output.getOutput(); // the whole output data
output.breaking(); // the breaking changes
output.nonBreaking(); // the non-breaking changes
output.unclassified(); // the unclassified changes
```

2. With overrides

```js
const output = diff(firstDocument, secondDocument, {
  override: {
    "/servers/*/protocol": {
      add: "non-breaking",
      remove: "breaking",
      edit: "unclassified",
    },
  },
});
```

## Output

This library supports outputs:

- JSON: `json`
- YAML: `yaml` or `yml`
- Markdown: `markdown` or `md`

```js
const jsonOutput = diff(firstDocument, secondDocument, {
  outputType: "json",
});

const yamlOutput = diff(firstDocument, secondDocument, {
  outputType: "yaml" | "yml",
});

const markdownOutput = diff(firstDocument, secondDocument, {
  outputType: "markdown" | "md",
});
```

With markdown output, you can also choose subtypes of the changes as JSON(`json`) or YAML(`yaml` or `yml`).

```js
const markdownOutput = diff(firstDocument, secondDocument, {
  outputType: "markdown" | "md",
  markdownSubtype: "json" | "yaml" | "yml",
});
```

## API

Checkout the [index](./docs/modules/index.md) document to see all the APIs this library offers.

## Develop

1. Write code and tests
2. Make sure all tests pass `npm run test`
3. Make sure code is well formatted and secure `npm run lint`

## Contributing

Help us make this library more robust. Read [CONTRIBUTING](https://github.com/asyncapi/.github/blob/master/CONTRIBUTING.md) guide & start contributing.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://aayushsahu.com/"><img src="https://avatars.githubusercontent.com/u/54525741?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aayush Kumar Sahu</b></sub></a><br /><a href="https://github.com/aayushmau5/diff/commits?author=aayushmau5" title="Code">💻</a> <a href="https://github.com/aayushmau5/diff/commits?author=aayushmau5" title="Documentation">📖</a> <a href="#maintenance-aayushmau5" title="Maintenance">🚧</a> <a href="#ideas-aayushmau5" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/aayushmau5/diff/pulls?q=is%3Apr+reviewed-by%3Aaayushmau5" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/aayushmau5/diff/commits?author=aayushmau5" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://www.brainfart.dev/"><img src="https://avatars.githubusercontent.com/u/6995927?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lukasz Gornicki</b></sub></a><br /><a href="#ideas-derberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/aayushmau5/diff/pulls?q=is%3Apr+reviewed-by%3Aderberg" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-derberg" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/magicmatatjahu"><img src="https://avatars.githubusercontent.com/u/20404945?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Maciej Urbańczyk</b></sub></a><br /><a href="https://github.com/aayushmau5/diff/pulls?q=is%3Apr+reviewed-by%3Amagicmatatjahu" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/jonaslagoni"><img src="https://avatars.githubusercontent.com/u/13396189?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jonas Lagoni</b></sub></a><br /><a href="https://github.com/aayushmau5/diff/pulls?q=is%3Apr+reviewed-by%3Ajonaslagoni" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/vinitshahdeo"><img src="https://avatars.githubusercontent.com/u/20594326?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vinit Shahdeo</b></sub></a><br /><a href="https://github.com/aayushmau5/diff/pulls?q=is%3Apr+reviewed-by%3Avinitshahdeo" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/anubhav-vats-0688b5187/"><img src="https://avatars.githubusercontent.com/u/46771418?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Anubhav Vats</b></sub></a><br /><a href="https://github.com/aayushmau5/diff/pulls?q=is%3Apr+reviewed-by%3Aonbit-uchenik" title="Reviewed Pull Requests">👀</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/shivensinha4"><img src="https://avatars.githubusercontent.com/u/19777714?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Shiven Sinha</b></sub></a><br /><a href="https://github.com/aayushmau5/diff/commits?author=shivensinha4" title="Code">💻</a> <a href="https://github.com/aayushmau5/diff/commits?author=shivensinha4" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/ron-debajyoti"><img src="https://avatars.githubusercontent.com/u/22571664?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Debajyoti Halder</b></sub></a><br /><a href="https://github.com/aayushmau5/diff/commits?author=ron-debajyoti" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
