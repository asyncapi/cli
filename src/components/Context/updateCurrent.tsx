import React, { FunctionComponent } from 'react';
import { useContextFile } from '../../hooks/context';
import { Text } from 'ink';


const UpdateCurrentContext: FunctionComponent<{ args: string[], options: any }> = ({ args }) => {
	let [key] = args;
	if (!key) {
		return <Text color="red">No key Provided</Text>
	}
	
	//@ts-ignore
	let { context, error } = useContextFile().changeCurrent(key);

	if(error){
		return <Text>{error.message}</Text>
	}

	return <Text color="greenBright">Your Context has been updated</Text>
}

export default UpdateCurrentContext