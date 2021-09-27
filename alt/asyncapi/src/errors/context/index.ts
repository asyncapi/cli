const NO_CONTEXTS_SAVED = 'No contexts saved yet, run asyncapi --help to learn more'
const CONTEXT_NOT_FOUND = (contextName: string) => `Context ${contextName} does not exists.`
const MISSING_CURRENT_CONTEXT = 'No context is set as current, please set a current context.'
const MISSING_ARGUMENTS = 'Missing arguments.'

export class ContextFileNotFoundError extends Error {
  constructor() {
    super()
    this.message = NO_CONTEXTS_SAVED
  }
}

export class ContextNotFoundError extends Error {
  constructor(contextName: string) {
    super()
    this.message = CONTEXT_NOT_FOUND(contextName)
  }
}

export class MissingCurrentContextError extends Error {
  constructor() {
    super()
    this.message = MISSING_CURRENT_CONTEXT
  }
}

export class MissingArgumentstError extends Error {
  constructor() {
    super()
    this.message = MISSING_ARGUMENTS
  }
}
