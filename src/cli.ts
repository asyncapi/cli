#!/usr/bin/env node
import 'reflect-metadata'
import { render } from 'ink';
import meow from 'meow';
import { commandsRouter } from "./CommandsRouter";


const cli = meow(`
	Usage
	  $ asyncapi command options
	  
	Commands
		validate 
			Options
				-c --context  context-name saved in the store
				-w --watch Enable watchMode (not implemented yet)
		context
			current  show the current set context
			list     show the list of all stored context
			remove  <context-name> remove a context from the store
			use <context-name>  set any context as current
			add <context-name> <filepath> add/update new context

	Examples
	  $ asyncapi context add dummy ./asyncapi.yml
	  $ asyncapi validate --context=dummy
`, {
	flags: {
		context: {
			alias: 'c',
			type: 'string',
			isRequired: false
		},
		watch: {
			alias: 'w',
			type: 'boolean',
			isRequired: false,
			default: false
		}
	}
});

render(commandsRouter(cli));
