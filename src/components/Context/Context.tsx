import React, { FunctionComponent } from 'react';
import { Text } from 'ink';
import { Options } from '../../CliModels';

interface ContextInput {
	options: Options,
	args: string[]
}

const Context: FunctionComponent<ContextInput> = ({ args }) => {
	let [subcommand] = args;

	switch (subcommand) {
		case 'current':
			return <Text></Text>
		case 'list':
			return <Text></Text>
		case 'remove':
			return <Text>Removing the current set context</Text>
		case 'use':
			return <Text>Using a context</Text>
		case 'create':
			return <Text></Text>
		default:
			return <Text color="red">Unsupported command</Text>
	}
}

export default Context;