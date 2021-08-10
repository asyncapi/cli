export const NO_CONTEXTS_SAVED = 'No contexts saved yet, run asyncapi --help to learn more';

export const CONTEXT_NOT_FOUND = (contextName: string) => `Context ${contextName} does not exists.`;

export const MISSING_CURRENT_CONTEXT = 'No context is set as current, please set a current context.';

export const MISSING_ARGUMENTS = 'Missing arguments.';

export const NEW_CONTEXT_ADDED = (contextName: string) => `New context added.\n\nYou can set it as your current context:\n asyncapi context use ${contextName}\nYou can use this context when needed with --context flag: asyncapi validate --context ${contextName}`;

export const CONTEXT_DELETED = 'context deleted successfully';

export const ValidationMessage = (filePath: string) => ({
  error: () => `File: ${filePath} does not exists or is not a file!`,
  message: () => `File: ${filePath} successfully validated!`
});
