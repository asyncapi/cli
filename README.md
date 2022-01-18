<h5 align="center">
  <br>
  <a href="https://www.asyncapi.org"><img src="https://github.com/asyncapi/parser-nodejs/raw/master/assets/logo.png" alt="AsyncAPI logo" width="200"></a>
  <br>
  AsyncAPI CLI
</h5>
<p align="center">
  <em>CLI to work with your AsyncAPI files. Currently supports validation, but it is under development for more features.</em>
</p>

<p align="center">
<a href="https://github.com/asyncapi/cli/blob/master/LICENSE"><img alt="GitHub license" src="https://img.shields.io/github/license/asyncapi/cli"></a>
<a href="https://github.com/asyncapi/cli/actions/workflows/if-nodejs-pr-testing.yml">
<img src="https://github.com/asyncapi/cli/actions/workflows/if-nodejs-pr-testing.yml/badge.svg" alt="PR testing - if Node project"  />
</a>
<a href="https://www.npmjs.com/package/@asyncapi/cli">
<img alt="npm" src="https://img.shields.io/npm/dw/@asyncapi/cli">
</a>

</p>

## Table of contents

<!-- toc -->

- [Installation](#installation)
  * [Using NPM and Node](#using-npm-and-node)
  * [MacOS](#macos)
    + [Using brew](#using-brew)
    + [Using pkg](#using-pkg)
- [Usage](#usage)
- [Contributing](#contributing)
  * [Set up development environment](#set-up-development-environment)
  * [Command Structure and Patterns](#command-structure-and-patterns)

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

## Usage

As of now, the `@asyncapi/cli` only supports validation of the specification file. (This is still under development for more features.)

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
  config    access configs
  help      display help for asyncapi
  new       creates a new asyncapi file
  validate  validate asyncapi file
```



## Contributing

Read [CONTRIBUTING](https://github.com/asyncapi/CLI/blob/master/CONTRIBUTING.md) guide.

### Set up development environment

Follow these steps:
- Clone the repo.
- Run `npm install` to install all the required dependencies
- Run `npm run test` to make sure everything is properly set up
- Run `npm run build` and then `bin/run` to try new CLI locally

UX developed for the CLI should be compliant with [Command Line Interface Guideline](https://clig.dev/)

### Command Structure and Patterns

We are following `verb + noun` and `namespace + noun + [verb]` pattern for making our commands and arguments. For example `asyncapi validate <spec-file-path>` and `asyncapi config context add <context-name> <spec-file-path>`.
