### Context concept


### Tips and tricks


### How to add context to a **project**
Context can be added to a project using two ways:
- programmatically, by executing command `asyncapi config context add [CONTEXT-NAME] [SPEC-FILE-PATH]`,
- manually, by creation of file `.asyncapi-cli` of the predefined format anywhere in the repository up the path of main executable, or in a user's home directory.

### Context file's structure
Context file is a JSON whose structure follows the structure of interface `IContextFile`:
```
interface IContextFile {
  current?: string;
  readonly store: {
    [name: string]: string;
  };
}
```
NB: If the context file doesn't pass internal validation, `ContextFileWrongFormatError` error is thrown.


### How to add context to the **context file**
`asyncapi config context add [CONTEXT-NAME] [SPEC-FILE-PATH]`
NB: On attempt to add context with name that already exists in the context file, `ContextAlreadyExistsError` error is thrown.

### How to list existing contexts in the context file
`asyncapi config context list`
NB: If context file contains only one empty property `store` then the whole context file is considered empty and corresponding message is displayed.


### How to set context in the context file as current
`asyncapi config context use [CONTEXT-NAME]`


### How to show current context in the context file
`asyncapi config context current`


### How to edit a context in the store
`config context edit [CONTEXT-NAME] [NEW-SPEC-FILE-PATH]`


### How to remove a context from the context file
`asyncapi config context remove [CONTEXT-NAME]`
