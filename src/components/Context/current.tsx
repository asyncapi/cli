import React, { FunctionComponent } from 'react';
import { Text, Box } from 'ink';
import { useContextFile } from '../../hooks/context/hook';

const Current: FunctionComponent = () => {
	const context = useContextFile().list();

	return <Box flexDirection="column">
		<Text>{context.current}</Text>
		<Text>{context.contexts[context.current]}</Text>
	</Box>
}

export default Current;