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

1. [Getting Started](#getting-started)
    - [Installation](#installation)
2. [Usage](#usage)
3. [API Reference](#api-reference)
    - [`validate`](#validate)
    - [`context`](#context)


## Getting Started
To run `@asyncapi/cli`, ensure that you have NodeJs >=v10. [Install NodeJs via package manager](https://nodejs.org/en/download/package-manager/).

### Installation
As of now the only way to install `asyncapi/cli` is using NPM. If you have NodeJs installed, it is most likely that you have NPM installed as well. 

```
npm install -g @asyncapi/cli
```

This installs the cli globaly on your system allowing you to run it from anywhere. If you want to install it locally, just remove the `-g` flag. 

[back to top ⏫](#table-of-contents)


## Usage

As of now `@asyncapi/cli` supports only validation of spcification file, but is under development for mode features.

We have well documented help commands so just run 

```
asyncapi --help 
```
[back to top ⏫](#table-of-contents)



## API Reference

### `validate`

**USAGE**

```
asyncapi validate <spcPath | context-name> [options]
```
If you have current context set then 
```
asyncapi validate
```

**OPTIONS** 

```
-h, --help Display help for command
-w, --watch Enable watch mode (not implemented yet)
```

[back to top ⏫](#table-of-contents)

## `context`

Context is what makes it easier for you to work with multiple Asyncapi Files. You can add multiple different files to a context. This way you do not have to pass file as a input everytime you use any command. You can also set a default context, so neither you have to pass in filepath or context name as a input. 

**USAGE**

```
asyncapi context [options] [command]
```

**COMMANDS**

|command|arguments|description|
|-------|---------|-----------|
|`list`|`none` |lists all saved context|
|`current`|`none`|set current context|
|`use` | `<context-name>`| set any context from the list as current|
|`add`|`<context-name> <spec-file-path>`|add/update a context|
|`remove`|`<context-name>`|remove a context from the list|

**OPTIONS**

```
-h, --help display help for command
```

[back to top ⏫](#table-of-contents)

