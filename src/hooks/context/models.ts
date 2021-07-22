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
    this.message = 'No contexts saved yet, run asyncapi --help to know more.';
  }
}

export class ContextNotFoundError extends Error {
  constructor() {
    super();
    this.message = 'This context key does not exist.';
  }
}

export class KeyNotFoundError extends Error {
  constructor() {
    super();
    this.message = 'Key not found.';
  }
}

export class DeletingCurrentContextError extends Error {
  constructor() {
    super();
    this.message = 'You are trying to delete a context that is currently in use.';
  }
}

export class MissingCurrentContextError extends Error {
  constructor() {
    super();
    this.message = 'No context is set as current, please set a current context.';
  }
}

export class MissingArgumentstError extends Error {
  constructor() {
    super();
    this.message = 'Missing arguments';
  }
}
