import * as messages from '../../messages';
export interface Context {
	current: string,
	store: {
		[name: string]: string
	}
}

export class SpecFileNotFoundError extends Error {
  constructor() {
    super();
    this.message = 'specification file not found in that path.';
  }
}

export class ContextFileNotFoundError extends Error {
  constructor() {
    super();
    this.message = messages.NO_CONTEXTS_SAVED;
  }
}

export class ContextNotFoundError extends Error {
  constructor() {
    super();
    this.message = messages.CONTEXT_NOT_FOUND;
  }
}

export class KeyNotFoundError extends Error {
  constructor() {
    super();
    this.message = messages.KEY_NOT_FOUND;
  }
}

export class DeletingCurrentContextError extends Error {
  constructor() {
    super();
    this.message = messages.DELETING_CURRENT_CONTEXT;
  }
}

export class MissingCurrentContextError extends Error {
  constructor() {
    super();
    this.message = messages.MISSING_CURRENT_CONTEXT;
  }
}

export class MissingArgumentstError extends Error {
  constructor() {
    super();
    this.message = messages.MISSING_ARGUMENTS;
  }
}
