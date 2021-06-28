import React from 'react';
import { Text, Box } from 'ink';
import { useContextFile } from '../../hooks/context';
import { ContextFileNotFoundError } from '../../hooks/context/errors';

const List = () => {
	let { context, error } = useContextFile().list();
	const generateResponse = () => {
		if (error instanceof ContextFileNotFoundError) {
			return <Text>{error.message}</Text>
		}

		if (context) {
			return <Text>{Object.keys(context.store).map(key => <Text key={key}>{key} : {context?.store[key]}</Text>)}</Text>
		}

		return;
	}
	return <Box flexDirection="column">
		{generateResponse()}
	</Box>
}


export default List;