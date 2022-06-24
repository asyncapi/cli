const CONTEXT_NOT_FOUND = (contextName: string) => `Context "${contextName}" does not exists.`;
const MISSING_CURRENT_CONTEXT = 'No context is set as current, please set a current context.';
export const NO_CONTEXTS_SAVED = `Specify what AsyncAPI file to be used.
No context has been set yet, 
To use a context as current you need to create one, follow these steps - 
 - Create a new context: asyncapi config context add <context-name> <file-path | URL>
 - Set this context as current: asyncapi config context use <context-name>
 - Try asyncapi --help to learn more about commands.
`;

class ContextError extends Error {
  constructor() {
    super();
    this.name = 'ContextError';
  }
}

export class MissingContextFileError extends ContextError {
  constructor() {
    super();
    this.message = NO_CONTEXTS_SAVED;
  }
}

export class MissingCurrentContextError extends ContextError {
  constructor() {
    super();
    this.message = MISSING_CURRENT_CONTEXT;
  }
}

export class ContextNotFound extends ContextError {
  constructor(contextName: string) {
    super();
    this.message = CONTEXT_NOT_FOUND(contextName);
  }
}
