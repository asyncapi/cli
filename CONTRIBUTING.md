# Overview

To contribute to this project, follow the rules from the general [CONTRIBUTING.md](https://github.com/kyma-project/community/blob/master/CONTRIBUTING.md) document in the `community` repository. 

## UX Requirements

### General Requirements 

UX developed for the CLI should be compliant with [Command Line Interface Guideline](https://clig.dev/).

### Command Structure and Patterns

We are following the `verb + noun` and `namespace + noun + [verb]` pattern making our commands and arguments. For example `asyncapi validate ./file/path` and `asyncapi config context add <context-name> <spec-file-path>`. 