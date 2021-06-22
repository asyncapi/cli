import React, { FunctionComponent } from 'react';
import { Text, Box } from 'ink';
import { useContextFile } from '../../hooks/context/hook';

const List: FunctionComponent = () => {
	let contextFile = useContextFile().list();

	return <Box flexDirection="column">
		{Object.keys(contextFile.contexts).map(key => <Box key={key} flexDirection="row">
			<Text color="greenBright">{key}</Text><Text> : </Text><Text color="magenta">{contextFile.contexts[key]}</Text>

		</Box>)}
	</Box>
}

export default List;