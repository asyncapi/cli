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
     -c --context  Your AsyncAPI specification
     -w --watch Enable watchMode (not implemented yet)

Examples
  $ asyncapi validate --context=specification.yml
```
