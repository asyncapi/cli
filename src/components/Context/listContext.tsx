import React, { FunctionComponent } from 'react';
import { useContextFile } from '../../hooks/context';
import { Box, Text } from 'ink';

const ListContexts: FunctionComponent = () => {
	let { context, error } = useContextFile().list();

	if (error) {
		return <Text>{error.message}</Text>
	}

	if (context) {
		return <Box flexDirection="column">
			{Object.keys(context.store).map(key => <Text key={key}>{key}: {context?.store[key]}</Text>)}
		</Box>
	}


	return <></>
}

export default ListContexts;