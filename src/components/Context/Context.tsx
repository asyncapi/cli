import React, { FunctionComponent } from 'react';
import { Text } from 'ink';
import { Options } from '../../CliModels';
import { useContextFile } from '../../hooks/context/hook';

interface ContextInput {
	options: Options,
	args: string[]
}

const Context: FunctionComponent<ContextInput> = ({ args }) => {
	let [subcommand] = args;
	let { context, setContextFile } = useContextFile();


	switch (subcommand) {
		case 'current':
			return <Text>Fetching current set context</Text>
		case 'list':
			console.log(context);
			return <Text></Text>
		case 'removing':
			return <Text>Removing the current set context</Text>
		case 'use':
			return <Text>Using a context</Text>
		case 'create':
			if (args[1] && args[2]) setContextFile(args[1], args[2])
			console.log(context);
			return <Text></Text>
		default:
			return <Text>Unsupported command</Text>
	}
}

export default Context;