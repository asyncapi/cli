<h5 align="center">
  <br>
  <a href="https://www.asyncapi.org"><img src="https://github.com/asyncapi/parser-nodejs/raw/master/assets/logo.png" alt="AsyncAPI logo" width="200"></a>
  <br>
  AsyncAPI CLI
</h5>
<p align="center">
  <em>CLI to work with your AsyncAPI files. Currently supports validation, but it is under development for more features.</em>
</p>

### Install
```bash
$ npm install --global @asyncapi/cli
```

### Getting Started
Go ahead and run command `asyncapi --help` to get complete help for using CLI. If having doubt about any particular command do run `asyncapi <command> --help` to get help for that command.  

### CLI
Help string for all the supported commands

- #### `asyncapi --help`
```
USAGE

asyncapi [options] [command]

OPTIONS

-h, --help display help for command
-v, --version output the version number

COMMANDS

validate validate asyncapi file 
context  Manage contexts
```

- #### `asyncapi validate --help`
```
USAGE

asyncapi validate [options]

OPTIONS

-h, --help display help for command
-f, --file <spec-file-path> Path of the asyncapi file
-c, --context <saved-context-name>  context name to use
-w, --watch Enable Watch Mode (not implemented yet)
```

- #### `asyncapi context --help`
```
USAGE

asyncapi context [options] [command] 

Context is what makes it easier for you to work with multiple AsyncAPI files.
You can add multiple different files to a contextThis way you do not have to pass 
--file flag with path to the file every time but just --context flag with reference name
You can also set a default context, so neither --file nor --context flags are needed.

OPTIONS

-h, --help display help for command 

COMMANDS

list list of all saved contexts 
current see current context 
use <context-name> set given context as default/current
add <context-name> <spec-file-path> add/update context
remove <context-name> remove a context

```

> For now --context flag is requried to run validate command