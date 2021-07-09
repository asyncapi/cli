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
  
  context
    current show the current set context
    list show the list of all stored contexts
    remove <context-name> remove a context from the store
    use <context-name> set any context from store as current
    add <context-name> <filepath> add/update new context

Examples
  $ asyncapi context add dummy ./asyncapi.yml
	  $ asyncapi validate --context=dummy
```

> For now --context flag is requried to run validate command