import React, { FunctionComponent } from 'react';
import { useContextFile } from '../../hooks/context';
import { Text, Box } from 'ink';

const CurrentContext: FunctionComponent = () => {
	const { response, error } = useContextFile().current();

	if (error) {
		return <Text>{error.message}</Text>
	}

	if (response) {
		return <Box>
			<Text>{response.key} : {response.path}</Text>
		</Box>
	}

	return <></>
}

export default CurrentContext;