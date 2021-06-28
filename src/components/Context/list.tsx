import React from 'react';
import { Text, Box } from 'ink';
import { useContextFile } from '../../hooks/context';

const List = () => {
	let { context, error } = useContextFile().list();
	if (!context) {
		return <Text color="red">{error.message}</Text>
	}
	const generateResponse = () => {
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