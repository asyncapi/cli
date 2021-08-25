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
```
$ asyncapi --help

Usage
  $ asyncapi command options
  
Commands
  validate 
   Options
     -c --context  context-name saved in the store
     -w --watch Enable watchMode (not implemented yet)
     -f --file File path of the specification file
  
  context
    current show the current set context
    list show the list of all stored contexts
    remove <context-name> remove a context from the store
    use <context-name> set any context from store as current
    add <context-name> <filepath> add/update new context

Examples
  $ asyncapi context add dummy ./asyncapi.yml
  $ asyncapi validate --context=dummy
  $ asyncapi validate --file=./asyncapi.yml
```

> For now --context flag is requried to run validate command