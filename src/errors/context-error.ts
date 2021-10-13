import * as messages from '../messages';

class ContextError extends Error {
  constructor() {
    super();
    this.name = 'Context Error';
  }
}

export class MissingContextFileError extends ContextError {
  constructor() {
    super();
    this.message = messages.NO_CONTEXTS_SAVED;
  }
}

export class MissingCurrentContextError extends ContextError {
  constructor() {
    super();
    this.message = messages.MISSING_CURRENT_CONTEXT;
  }
}

export class ContextNotFound extends ContextError {
  constructor(contextname: string) {
    super();
    this.message = messages.CONTEXT_NOT_FOUND(contextname);
  }
}

export class NoSpecPathFoundError extends ContextError {
  constructor(command: string) {
    super();
    this.message = messages.NO_SPEC_FOUND(command);
  }
}
