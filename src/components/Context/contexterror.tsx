import React from 'react';
import { Text } from 'ink';

const ContextError: React.FunctionComponent<{ error: Error }> = ({ error }) => {
  return <Text>{error.message}</Text>;
};

export default ContextError;
