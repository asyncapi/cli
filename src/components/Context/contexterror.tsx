/* eslint-disable no-use-before-define */
import React, { FunctionComponent } from 'react';
import { Text } from 'ink';
import { ContextFileNotFoundError, DeletingCurrentContextError, KeyNotFoundError } from '../../hooks/context';

const ContextError: FunctionComponent<{ error: Error }> = ({ error }) => {
  if (error instanceof ContextFileNotFoundError) {
    return <Text>No contexts saved yet.</Text>;
  }

  if (error instanceof KeyNotFoundError) {
    return <Text>The context you are trying to use is not present</Text>;
  }

  if (error instanceof DeletingCurrentContextError) {
    return <Text>You are trying to delete a context that is set as current.</Text>;
  }

  return <Text>{error.message}</Text>;
};

export default ContextError;
