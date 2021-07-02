import React, { FunctionComponent } from 'react';
import { Text } from 'ink';
import { ContextFileNotFoundError } from '../../hooks/context';

const ContextError: FunctionComponent<{ error: Error }> = ({ error }) => {

	if (error instanceof ContextFileNotFoundError) {
		return <Text>No contexts saved yet.</Text>
	}

	return <Text>{error.message}</Text>
};

export default ContextError;