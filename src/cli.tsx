#!/usr/bin/env node
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

render(<App file={cli.flags.file} watch={cli.flags.watch}/>);
