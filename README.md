[![AsyncAPI CLI](./assets/logo.png)](https://www.asyncapi.com)

CLI to work with your AsyncAPI files. Currently under development, we are working to bring more features. 

[![GitHub license](https://img.shields.io/github/license/asyncapi/cli)](https://github.com/asyncapi/cli/blob/master/LICENSE)
[![PR testing - if Node project](https://github.com/asyncapi/cli/actions/workflows/if-nodejs-pr-testing.yml/badge.svg)](https://github.com/asyncapi/cli/actions/workflows/if-nodejs-pr-testing.yml)
[![npm](https://img.shields.io/npm/dw/@asyncapi/cli)](https://www.npmjs.com/package/@asyncapi/cli)

## Table of contents

<!-- toc -->

- [Installation](#installation)
  * [Using NPM and Node](#using-npm-and-node)
  * [MacOS](#macos)
    + [Using brew](#using-brew)
    + [Using pkg](#using-pkg)
  * [Linux](#linux)
    + [For debian based distros](#for-debian-based-distros)
    + [For other distros](#for-other-distros)
- [Usage](#usage)
- [Contributing](#contributing)
  * [Set up development environment](#set-up-development-environment)
  * [Command Structure and Patterns](#command-structure-and-patterns)
- [Contributors](#contributors)

<!-- tocstop -->

## Installation

### Using NPM and Node

To run `@asyncapi/cli`, you'll need Node.js >=v10

Run this terminal command to check your Node.js version:

```
node -v
```

> If you don't have Node.js installed or NPM, simply [install both via package manager](https://nodejs.org/en/download/package-manager/)

Install the CLI globaly on your system run CLI it from anywhere:

```
npm install -g @asyncapi/cli
```

### MacOS

#### Using brew

You can install this CLI using [`brew`](https://brew.sh/) package manager.

```bash
# Install brew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# Install AsyncAPI CLI
brew install asyncapi
```

#### Using pkg

Each release of CLI produces a MacOS dedicated `pkg` file that enables you to install this CLI as MacOS application.

```bash
# Download latest release. To download specific release, your link should look similar to https://github.com/asyncapi/cli/releases/download/v0.13.0/asyncapi.pkg. All releases are listed in https://github.com/asyncapi/cli/releases
curl -OL https://github.com/asyncapi/cli/releases/latest/download/asyncapi.pkg
# Install AsyncAPI CLI
sudo installer -pkg asyncapi.pkg -target /
```

### Linux

#### For debian based distros

You can install this CLI using `dpkg`, a package manager for debian.

```bash
# Download latest release. To download specific release, your link should look similar to https://github.com/asyncapi/cli/releases/download/v0.13.0/asyncapi.deb. All releases are listed in https://github.com/asyncapi/cli/releases
curl -OL https://github.com/asyncapi/cli/releases/latest/download/asyncapi.deb
# Install AsyncAPI CLI
sudo dpkg -i asyncapi.deb
```

#### For other distros

You can install this CLI using the archive(`tar.gz`) file.

```bash
# Download latest release. To download specific release, your link should look similar to https://github.com/asyncapi/cli/releases/download/v0.13.0/asyncapi.tar.gz. All releases are listed in https://github.com/asyncapi/cli/releases
curl -OL https://github.com/asyncapi/cli/releases/latest/download/asyncapi.tar.gz
# Untar the archive file
tar -xzf asyncapi.tar.gz
```

The above step will create an `asyncapi` directory in the current path.

Create a symlink to run the CLI from anywhere. We will create the symlink in `/usr/local/bin` directory since this directory is already in the `PATH`.

```bash
# cd into the unarchived directory
cd asyncapi

# get the absolute path
pwd

# Create a symlink
ln -s <absolute-path>/bin/asyncapi /usr/local/bin/asyncapi

# The `asyncapi` command should be available to be used
asyncapi
```

## Usage

`@asyncapi/cli` makes it easier to work with asyncpi files. 

We have well-documented help commands so just run:

```
asyncapi --help
```

It should print something like:

```
All in one CLI for all AsyncAPI tools

USAGE
  $ asyncapi [COMMAND]

COMMANDS
  config     access configs
  diff       find diff between two AsyncAPI files
  new        creates a new AsyncAPI file
  start      starts a new local instance of Studio
  validate   validate an AsyncAPI file
  bundle     bundle one or multiple asyncapi documents and their references together
  generate   generate all kinds of stuff
    models       generate all the typed models for the message payloads defined in the AsyncAPI file
      typescript    generate the models for TypeScript
      csharp        generate the models for C#
      golang        generate the models for Go
      java          generate the models for Java
      javascript    generate the models for JavaScript
      dart          generate the models for Dart
      python        generate the models for Python
      rust          generate the models for Rust
    fromTemplate    generate whatever you want using templates compatible with AsyncAPI Generator 
```

## Contributing

Read [CONTRIBUTING](https://github.com/asyncapi/.github/blob/master/CONTRIBUTING.md) guide.

### Set up development environment

Follow these steps:

- Clone the repo.
- Run `npm install` to install all the required dependencies
- Run `npm run test` to make sure everything is properly set up
- Run `npm run build` and then `bin/run` to try new CLI locally

UX developed for the CLI should be compliant with [Command Line Interface Guideline](https://clig.dev/)

### Command Structure and Patterns

We are following `verb + noun` and `namespace + noun + [verb]` pattern for making our commands and arguments. For example `asyncapi validate <spec-file-path>` and `asyncapi config context add <context-name> <spec-file-path>`.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/jotamusik"><img src="https://avatars.githubusercontent.com/u/14940638?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jorge Aguiar Martín</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=jotamusik" title="Code">💻</a> <a href="#ideas-jotamusik" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/asyncapi/cli/commits?author=jotamusik" title="Tests">⚠️</a> <a href="https://github.com/asyncapi/cli/commits?author=jotamusik" title="Documentation">📖</a></td>
    <td align="center"><a href="https://www.brainfart.dev/"><img src="https://avatars.githubusercontent.com/u/6995927?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lukasz Gornicki</b></sub></a><br /><a href="#ideas-derberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/asyncapi/cli/commits?author=derberg" title="Code">💻</a> <a href="https://github.com/asyncapi/cli/pulls?q=is%3Apr+reviewed-by%3Aderberg" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-derberg" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://souvik.vercel.app/"><img src="https://avatars.githubusercontent.com/u/41781438?v=4?s=100" width="100px;" alt=""/><br /><sub><b>souvik</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=Souvikns" title="Code">💻</a> <a href="#ideas-Souvikns" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/asyncapi/cli/commits?author=Souvikns" title="Tests">⚠️</a> <a href="https://github.com/asyncapi/cli/pulls?q=is%3Apr+reviewed-by%3ASouvikns" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-Souvikns" title="Maintenance">🚧</a> <a href="https://github.com/asyncapi/cli/commits?author=Souvikns" title="Documentation">📖</a></td>
    <td align="center"><a href="https://boyney.io/"><img src="https://avatars.githubusercontent.com/u/3268013?v=4?s=100" width="100px;" alt=""/><br /><sub><b>David Boyne</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=boyney123" title="Code">💻</a> <a href="#ideas-boyney123" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-boyney123" title="Maintenance">🚧</a></td>
    <td align="center"><a href="http://www.fmvilas.com/"><img src="https://avatars.githubusercontent.com/u/242119?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Fran Méndez</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=fmvilas" title="Code">💻</a> <a href="#ideas-fmvilas" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/asyncapi/cli/pulls?q=is%3Apr+reviewed-by%3Afmvilas" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/magicmatatjahu"><img src="https://avatars.githubusercontent.com/u/20404945?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Maciej Urbańczyk</b></sub></a><br /><a href="https://github.com/asyncapi/cli/pulls?q=is%3Apr+reviewed-by%3Amagicmatatjahu" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-magicmatatjahu" title="Maintenance">🚧</a> <a href="#ideas-magicmatatjahu" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://aayushsahu.com/"><img src="https://avatars.githubusercontent.com/u/54525741?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aayush Kumar Sahu</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=aayushmau5" title="Code">💻</a> <a href="https://github.com/asyncapi/cli/commits?author=aayushmau5" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/mihirterna"><img src="https://avatars.githubusercontent.com/u/31316452?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mihir Kulkarni</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=mihirterna" title="Code">💻</a></td>
    <td align="center"><a href="https://imabp.github.io/resume/"><img src="https://avatars.githubusercontent.com/u/53480076?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Abir</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=imabp" title="Tests">⚠️</a> <a href="https://github.com/asyncapi/cli/commits?author=imabp" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/peter-rr"><img src="https://avatars.githubusercontent.com/u/81691177?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Peter Ramos</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=peter-rr" title="Code">💻</a></td>
    <td align="center"><a href="https://samridhi-98.github.io/Portfolio"><img src="https://avatars.githubusercontent.com/u/54466041?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Samriddhi</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=Samridhi-98" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://linktr.ee/KharabePranay"><img src="https://avatars.githubusercontent.com/u/68046838?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pranay Kharabe</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=pranay202" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
