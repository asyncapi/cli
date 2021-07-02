import React, { FunctionComponent } from 'react';
import { Text } from 'ink';
import { ContextFileNotFoundError, KeyNotFoundError } from '../../hooks/context';

const ContextError: FunctionComponent<{ error: Error }> = ({ error }) => {

	if (error instanceof ContextFileNotFoundError) {
		return <Text>No contexts saved yet.</Text>
	}

	if(error instanceof KeyNotFoundError){
		return <Text>The context you are trying to use is not present</Text>
	}

	return <Text>{error.message}</Text>
};

export default ContextError;