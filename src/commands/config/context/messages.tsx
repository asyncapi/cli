import React, { ReactElement } from 'react';
import { injectable } from 'tsyringe';
import { Text, Box } from 'ink';
import { Context } from '../../../config/context';
import {
  NO_CONTEXTS_SAVED,
  CONTEXT_NOT_FOUND,
  MISSING_CURRENT_CONTEXT,
  NEW_CONTEXT_ADDED,
  CONTEXT_DELETED
} from '../../../messages';

@injectable()
export class Messages {
  notContextSaved(): string {
    return NO_CONTEXTS_SAVED;
  }

  contextNotFound(contextName: string): string {
    return CONTEXT_NOT_FOUND(contextName);
  }

  missingCurrentContext(): string {
    return MISSING_CURRENT_CONTEXT;
  }

  contextAdded(contextName: string) {
    return NEW_CONTEXT_ADDED(contextName);
  }

  removeContext() {
    return CONTEXT_DELETED;
  }
}

@injectable()
export class ContextMessageWriter {
  list(ctx: Context): ReactElement {
    return <Box flexDirection="column">
      {Object.keys(ctx.store).map((contextName: string) => <Text key={contextName}>{contextName}</Text>)}
    </Box>;
  } 

  current(ctx: Context): ReactElement {
    return <Text>{ctx.current}</Text>;
  }

  add(message: string): ReactElement {
    return <Text color="green">{message}</Text>;
  }

  use(ctx: Context): ReactElement {
    return <Text>{ctx.current}: {ctx.getContext(ctx.current as string)}</Text>;
  }

  remove(message: string): ReactElement {
    return <Text>{message}</Text>;
  }

  throwError(message: string) {
    return <Text color="red">{message}</Text>;
  }
}
