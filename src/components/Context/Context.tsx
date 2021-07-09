import { useContextFile } from '../../hooks/context';
import React, { FunctionComponent } from 'react';
import { Box, Text } from 'ink';
import ContextError from './contexterror';
import { SpecificationFile } from '../../hooks/validation';

export const ListContexts: FunctionComponent = () => {
	const { response, error } = useContextFile().list();

	if (error) {
		return <ContextError error={error} />
	}

	if (response) {
		return <Box flexDirection="column">
			{response.map((context: any) => <Text key={context.key}>{context.key} : {context.path}</Text>)}
		</Box>
	}

	return <></>
}

export const ShowCurrentContext: FunctionComponent = () => {
	const { response, error } = useContextFile().current();

	if (error) {
		return <ContextError error={error} />
	}

	if (response) {
		return <Text>{response.key} : {response.path}</Text>
	}

	return <></>
}

export const AddContext: FunctionComponent<{ options: any, args: string[] }> = ({ args }) => {
	const [key, path] = args

	if (!key || !path) {
		return <ContextError error={new Error("missing arguments")} />
	}

	const { response, error } = useContextFile().addContext(key, new SpecificationFile(path));

	if (error) {
		return <ContextError error={error} />
	}

	return <Text>{response}</Text>
}

export const SetCurrent: FunctionComponent<{ options: any, args: string[] }> = ({ args }) => {
	const [key,] = args;

	if (!key) {
		return <ContextError error={new Error("missing arguments")} />
	}

	const { response, error } = useContextFile().setCurrent(key);

	if (error) {
		return <ContextError error={error} />
	}

	if (response) {
		return <Text>{response.key} : {response.path}</Text>
	}

	return <></>
}

export const RemoveContext: FunctionComponent<{ options: any, args: string[] }> = ({ args }) => {
	const [key] = args;

	if (!key) {
		return <ContextError error={new Error("missing arguments")} />
	}

	const { response, error } = useContextFile().deleteContext(key);

	if (error) {
		return <ContextError error={error} />
	}

	return <Text>{response}</Text>
}