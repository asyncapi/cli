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
				-c --context  Your AsyncAPI specification
				-w --watch Enable watchMode (not implemented yet)
		context
			current                show the current set context
			list     			   list all the contexts
			remove  			   remove the current set context 
			use <fileName|URL>     set/update context 

	Examples
	  $ asyncapi validate --context=specification.yml
`, {
	flags: {
		context: {
			alias: 'c',
			type: 'string',
			isRequired: true
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
