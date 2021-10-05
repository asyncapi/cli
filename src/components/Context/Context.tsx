import React from 'react';
import { Box, Text } from 'ink';

import ContextError from './contexterror';
import { useContextFile, MissingArgumentstError } from '../../hooks/context';
import { SpecificationFile } from '../../hooks/validation';
import { ARGUMENTS } from '../../messages';
export const ListContexts: React.FunctionComponent = () => {
  const { response, error } = useContextFile().list();

  if (error) {
    return <ContextError error={error} />;
  }

  if (response) {
    return (
      <Box flexDirection="column">
        {response.map((context: any) => <Text key={context.key}>{context.key} : {context.path}</Text>)}
      </Box>
    );
  }

  return null;
};

export const ShowCurrentContext: React.FunctionComponent = () => {
  const { response, error } = useContextFile().current();

  if (error) {
    return <ContextError error={error} />;
  }

  if (response) {
    return <Text>{response.key} : {response.path}</Text>;
  }

  return null;
};

export const AddContext: React.FunctionComponent<{ options: any, args: string[] }> = ({ args }) => {
  const [key, path] = args;

  if (!key) {
    return <ContextError error={new MissingArgumentstError(ARGUMENTS.CONTEXT_NAME, ARGUMENTS.CONTEXT)} />;
  } else if (!path) {
    return <ContextError error={new MissingArgumentstError(ARGUMENTS.SPEC_PATH, ARGUMENTS.CONTEXT)} />;
  }

  const { response, error } = useContextFile().addContext(key, new SpecificationFile(path));

  if (error) {
    return <ContextError error={error} />;
  }

  return <Text>{response}</Text>;
};

export const SetCurrent: React.FunctionComponent<{ options: any, args: string[] }> = ({ args }) => {
  const [key,] = args;

  if (!key) {
    return <ContextError error={new MissingArgumentstError(ARGUMENTS.CONTEXT_NAME, ARGUMENTS.CONTEXT)} />;
  }

  const { response, error } = useContextFile().setCurrent(key);

  if (error) {
    return <ContextError error={error} />;
  }

  if (response) {
    return <Text>{response.key} : {response.path}</Text>;
  }

  return null;
};

export const RemoveContext: React.FunctionComponent<{ options: any, args: string[] }> = ({ args }) => {
  const [key] = args;

  if (!key) {
    return <ContextError error={new MissingArgumentstError(ARGUMENTS.CONTEXT_NAME, ARGUMENTS.CONTEXT)} />;
  }

  const { response, error } = useContextFile().deleteContext(key);

  if (error) {
    return <ContextError error={error} />;
  }

  return <Text>{response}</Text>;
};
