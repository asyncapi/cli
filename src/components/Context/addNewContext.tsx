import React, { FunctionComponent } from 'react';
import { Text } from 'ink';
import { useContextFile } from '../../hooks/context';
import { SpecificationFile } from '../../hooks/validation';

const AddNewContext: FunctionComponent<{ args: string[], options: any }> = ({ args }) => {
	let [key, path] = args;

	if (!key || !path) {
		return <Text color="red">Missing parameters</Text>
	}

	let { context, error } = useContextFile().addContext(key, new SpecificationFile(path));

	if (error) {
		return <Text>{error.message}</Text>
	}

	if (context) {
		return <Text>{key} : {context.store[key]}</Text>
	}

	return <></>
}

export default AddNewContext;