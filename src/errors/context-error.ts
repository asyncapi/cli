const NO_CONTEXTS_SAVED = 'No contexts saved yet, run asyncapi --help to learn more';
const CONTEXT_NOT_FOUND = (contextName: string) => `Context "${contextName}" does not exists.`;
const MISSING_CURRENT_CONTEXT = 'No context is set as current, please set a current context.';

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
