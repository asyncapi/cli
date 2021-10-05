import * as messages from '../../messages';
export interface Context {
  current: string,
  store: {
    [name: string]: string
  }
}

export class SpecFileNotFoundError extends Error {
  constructor(specPath: string) {
    super();
    this.message = messages.ValidationMessage(specPath).error();
  }
}

export class ContextFileNotFoundError extends Error {
  constructor() {
    super();
    this.message = messages.NO_CONTEXTS_SAVED;
  }
}

export class ContextNotFoundError extends Error {
  constructor(contextName: string) {
    super();
    this.message = messages.CONTEXT_NOT_FOUND(contextName);
  }
}

export class MissingCurrentContextError extends Error {
  constructor() {
    super();
    this.message = messages.MISSING_CURRENT_CONTEXT;
  }
}

export class MissingArgumentstError extends Error {
  constructor(argument: string, command: string) {
    super();
    this.message = messages.MISSING_ARGUMENTS(argument, command);
  }
}

export class NoSpecPathFoundError extends Error {
  constructor(command: string) {
    super();
    this.message = messages.NO_SPEC_FOUND(command);
  }
}
