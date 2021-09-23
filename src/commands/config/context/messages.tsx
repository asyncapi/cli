import React, { FunctionComponent } from 'react';
import { injectable } from 'tsyringe';
import { Text, Box } from 'ink';

export interface IContextMessageWriter {
  list: FunctionComponent<{store?: {[name: string]: string}}>
}

@injectable()
export class ContextMessageWriter implements IContextMessageWriter {
  list: FunctionComponent<{store?: {[name: string]: string}}> = ({store}) => {
    return <Box flexDirection="column">
      {Object.keys(store as any).map((contextName: string) => <Text key={contextName}>{contextName}</Text>)}
    </Box>;
  }
}
