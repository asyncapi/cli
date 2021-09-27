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
* [`asyncapi context`](#asyncapi-context)
* [`asyncapi context:add [CONTEXT-NAME] [ASYNCAPI-FILE-PATH]`](#asyncapi-contextadd-context-name-asyncapi-file-path)
* [`asyncapi context:current`](#asyncapi-contextcurrent)
* [`asyncapi context:list`](#asyncapi-contextlist)
* [`asyncapi context:remove [CONTEXT-NAME]`](#asyncapi-contextremove-context-name)
* [`asyncapi context:use [CONTEXT-NAME]`](#asyncapi-contextuse-context-name)
* [`asyncapi help [COMMAND]`](#asyncapi-help-command)
* [`asyncapi validate [FILE]`](#asyncapi-validate-file)

## `asyncapi context`

```
USAGE
  $ asyncapi context

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/context.ts](https://github.com/asyncapi/cli/blob/v0.1.0/src/commands/context.ts)_

## `asyncapi context:add [CONTEXT-NAME] [ASYNCAPI-FILE-PATH]`

add/update a context

```
USAGE
  $ asyncapi context add [CONTEXT-NAME] [ASYNCAPI-FILE-PATH]

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/context/add.ts](https://github.com/asyncapi/cli/blob/v0.1.0/src/commands/context/add.ts)_

## `asyncapi context:current`

see current context

```
USAGE
  $ asyncapi context current

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/context/current.ts](https://github.com/asyncapi/cli/blob/v0.1.0/src/commands/context/current.ts)_

## `asyncapi context:list`

list all saved contexts

```
USAGE
  $ asyncapi context list

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/context/list.ts](https://github.com/asyncapi/cli/blob/v0.1.0/src/commands/context/list.ts)_

## `asyncapi context:remove [CONTEXT-NAME]`

remove a context

```
USAGE
  $ asyncapi context remove [CONTEXT-NAME]

OPTIONS
  -h, --help  show CLI help

ALIASES
  $ asyncapi context rm
```

_See code: [src/commands/context/remove.ts](https://github.com/asyncapi/cli/blob/v0.1.0/src/commands/context/remove.ts)_

## `asyncapi context:use [CONTEXT-NAME]`

set given context as default/current

```
USAGE
  $ asyncapi context use [CONTEXT-NAME]

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/context/use.ts](https://github.com/asyncapi/cli/blob/v0.1.0/src/commands/context/use.ts)_

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
