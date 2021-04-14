#!/usr/bin/env node
import 'reflect-metadata'
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './components/App/App';

const cli = meow(`
	Usage
	  $ asdf

	Options
		-f --file  Your AsyncAPI specification
		-w --watch Enable watchMode

	Examples
	  $ asdf --name=Jane
	  Hello, Jane
`, {
	flags: {
		file: {
			alias: 'f',
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

console.log(cli.input)

// const [actor, ...arguments] = cli.input;
//
// const actorsDictionary = (arguments, context) => ({
// 	['get']: <Get argumnets={arguments} context={context}/>,
// 	['validate']: <Validate />
// })
//
// actorsDictionary(arguments, { file: cli.flags.file, watch: cli.flags.watch })[actor]


render(<App context={ { file: cli.flags.file, watch: cli.flags.watch } }/>);
