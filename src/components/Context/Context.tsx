import React, { FunctionComponent } from 'react';
import { Text } from 'ink';
import { Options } from '../../CliModels';
import List from './list';
import Current from './current';

interface ContextInput {
	options: Options,
	args: string[]
}

const Context: FunctionComponent<ContextInput> = ({ args }) => {
	let [subcommand] = args;

	switch (subcommand) {
		case 'current':
			return <Current />
		case 'list':
			return <List />
		case 'remove':
			return <Text>Removing the current set context</Text>
		case 'use':
			return <Text>Using a context</Text>
		case 'create':
			return <Text></Text>
		default:
			return <Text>Unsupported command</Text>
	}
}

export default Context;