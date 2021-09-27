asyncapi
========

The AsyncAPI CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/asyncapi.svg)](https://npmjs.org/package/asyncapi)
[![Downloads/week](https://img.shields.io/npm/dw/asyncapi.svg)](https://npmjs.org/package/asyncapi)
[![License](https://img.shields.io/npm/l/asyncapi.svg)](https://github.com/asyncapi/cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @asyncapi/cli
$ asyncapi COMMAND
running command...
$ asyncapi (-v|--version|version)
@asyncapi/cli/0.1.0 darwin-x64 node-v14.15.1
$ asyncapi --help [COMMAND]
USAGE
  $ asyncapi COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`asyncapi context [FILE]`](#asyncapi-context-file)
* [`asyncapi help [COMMAND]`](#asyncapi-help-command)
* [`asyncapi validate [FILE]`](#asyncapi-validate-file)

## `asyncapi context [FILE]`

describe the command here

```
USAGE
  $ asyncapi context [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/context.ts](https://github.com/asyncapi/cli/blob/v0.1.0/src/commands/context.ts)_

## `asyncapi help [COMMAND]`

display help for asyncapi

```
USAGE
  $ asyncapi help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_

## `asyncapi validate [FILE]`

validates an AsyncAPI file

```
USAGE
  $ asyncapi validate [FILE]

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/validate.ts](https://github.com/asyncapi/cli/blob/v0.1.0/src/commands/validate.ts)_
<!-- commandsstop -->
