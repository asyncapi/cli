---
title: 'Context concept'
weight: 50
---

## Overview

AsyncAPI CLI provides functionality called `context`. It's purpose is to help to work with AsyncAPI CLI in large projects where you do not have just one service exposing AsyncAPI document, but multiple.

Event driven architecture involves multiple actors, subscribers and publishers. One time you want to validate document **A** and the other time you want to generate models from document **B**. Every time you do it, you need to provide to AsyncAPI CLI the location of the AsyncAPI document, which might be time consuming. You can workaround it with aliases in bash profiles or with other solutions but it is better to use `context` feature as you can then store it in your repository and share with other team members.

In short it means that for example instead of writing `asyncapi validate /some/folder/my-asyncapi.yml` you can create a context called `myasync` that will point to `/some/folder/my-asyncapi.yml`. This way next time you use the CLI you can do `asyncapi validate myasync`.

### Context File location

You can have a global context for your workstation, and a project specific context.

If your use case is that you work with multiple repositories, you might want to use a global context. The `.asyncapi-cli` context file is then located in your home directory. This file is automatically created by the CLI once you run `asyncapi config context add` in a project that doesn't have its own context file

You can also store your custom `.asyncapi-cli` file in your project with custom configuration. This way when you run `asyncapi config context add` inside your project, the new context is added to the context file under your project.

### How to add context to a project

1. Create file `.asyncapi-cli` in the root of your project
2. Execute command `asyncapi config context add [CONTEXT-NAME] [SPEC-FILE-PATH]`

### Context File structure

##### Fixed Fields

Field Name | Type | Description
---|:---:|---
current | `string` | An optional string value representing one of context names used as default in CLI.
store | [Store Object](#storeObject) | Map of filesystem paths to target AsyncAPI documents.

#### <a name="storeObject"></a>Store Object

Map of filesystem paths to target AsyncAPI documents.

##### Patterned Fields

Field Pattern | Type | Description
---|:---:|---
{contextName} | `string` | **REQUIRED**. A filesystem path to the target AsyncAPI document.

##### Context File Example

Example of a context file utilizing [Event Driven Flight status notification service](https://github.com/amadeus4dev-examples/amadeus-async-flight-status/tree/ff433b6d320a3a6a2499976cbf0782353bc57c16) of the Amadeus Airline Platform:
```
{
  "current": "monitor",
  "store": {
    "monitor": "monitor/asyncapi.yaml",
    "notifier": "notifier/asyncapi.yaml",
    "subscriber": "subscriber/asyncapi.yaml"
  }
}
```

### How to work with context using CLI

All commands for managing contexts are available under `asyncapi config context` [CLI commands group](usage#asyncapi-config-context).
