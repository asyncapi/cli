import { useContextFile } from '../../hooks/context';
import React, { FunctionComponent } from 'react';
import { Box, Text } from 'ink';
import ContextError from './contexterror';
import { SpecificationFile } from '../../hooks/validation';

export const ListContexts: FunctionComponent = () => {
	let { response, error } = useContextFile().list();

	if (error) {
		return <ContextError error={error} />
	}

	if (response) {
		return <Box flexDirection="column">
			{response.map(el => <Text key={el.key}>{el.key} : {el.path}</Text>)}
		</Box>
	}

	return <></>
}

export const ShowCurrentContext: FunctionComponent = () => {
	let { response, error } = useContextFile().current();

	if (error) {
		return <ContextError error={error} />
	}

	if (response) {
		return <Text>{response.key} : {response.path}</Text>
	}

	return <></>
}

export const AddContext: FunctionComponent<{ options: any, args: string[] }> = ({ args }) => {
	let [key, path] = args

	if (!key || !path) {
		return <ContextError error={new Error("missing arguments")} />
	}

	let { response, error } = useContextFile().addContext(key, new SpecificationFile(path));

	if (error) {
		return <ContextError error={error} />
	}

	return <Text>{response}</Text>
}

export const SetCurrent: FunctionComponent<{ options: any, args: string[] }> = ({ args }) => {
	let [key, ] = args;

	if (!key) {
		return <ContextError error={new Error("missing arguments")} />
	}

	let { response, error } = useContextFile().setCurrent(key);

	if (error) {
		return <ContextError error={error} />
	}

	if (response) {
		return <Text>{response.key} : {response.path}</Text>
	}

	return <></>
}