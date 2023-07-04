---
title: 'Context concept'
weight: 50
---

## Overview

AsyncAPI CLI provides functionality called `context`. It's purpose is to help to work with AsyncAPI CLI in large projects where you do not have just one service exposing AsyncAPI document, but multiple.

Event driven architecture involves multiple actors, subscribers and publishers. One time you want to validate document **A** and the other time you want to generate models from document **B**. Every time you do it, you need to provide to AsyncAPI CLI the location of the AsyncAPI document, which might be time consuming. You can workaround it with aliases in bash profiles or with other solutions but it is better to use `context` feature as you can then store it in your repository and share with other team members.

In short it means that for example instead of writing `asyncapi validate /some/folder/my-asyncapi.yml` you can create a context called `myasync` that will point to `/some/folder/my-asyncapi.yml`. This way next time you use the CLI you can do `asyncapi validate myasync`.

### How to add context to a project

Context can be added to a project in two ways:
- using CLI, by executing command `asyncapi config context add [CONTEXT-NAME] [SPEC-FILE-PATH]`,
- manually, by creation of file `.asyncapi-cli` of the predefined format anywhere in the repository up the path of main executable, or in a user's home directory.

### Context file's structure

Example of a context file utilizing [Event Driven Flight status notification service](https://github.com/amadeus4dev-examples/amadeus-async-flight-status/tree/ff433b6d320a3a6a2499976cbf0782353bc57c16) of the Amadeus Airline Platform (property `current` is optional in `.asyncapi-cli` file):
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

All commands for managing contexts are available under `asyncapi config context` [CLI commands group](usage.md#asyncapi-config-context).
