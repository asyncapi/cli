/* eslint-disable security/detect-object-injection */
export const NO_CONTEXTS_SAVED = 'No contexts saved yet, run asyncapi --help to learn more';

export const CONTEXT_NOT_FOUND = (contextName: string) => `Context ${contextName} does not exists.`;

export const MISSING_CURRENT_CONTEXT = 'No context is set as current, please set a current context.';

export const MISSING_ARGUMENTS = (argument: string, command: string) => `Missing arguments: ${argument}\nrun asyncapi ${command} --help to know more.`;

export const NEW_CONTEXT_ADDED = (contextName: string) => `New context added.\n\nYou can set it as your current context: asyncapi context use ${contextName}\nYou can use this context when needed by passing ${contextName} as a parameter: asyncapi valiate ${contextName}`;

export const CONTEXT_DELETED = 'context deleted successfully';

export const ValidationMessage = (filePath: string) => ({
  error: () => `File: ${filePath} does not exists or is not a file!`,
  message: () => `File: ${filePath} successfully validated!`
});

export const NO_SPEC_FOUND = (command: string) => `${FALLBACK_MESSAGES[command]}\n\nThese are your options to specify in the CLI what AsyncAPI file should be used:\n- You can provide a path to the AsyncAPI file: asyncapi ${command} path/to/file/asyncapi.yml\n- You can also pass a saved context that points to your AsyncAPI file: asyncapi ${command} mycontext\n- In case you did not specify a context that you want to use, the CLI checks if there is a default context and uses it. To set default context run: asyncapi context use mycontext\n- In case you did not provide any reference to AsyncAPI file and there is no default context, the CLI detects if in your current working directory you have files like asyncapi.json, asyncapi.yaml, asyncapi.yml. Just rename your file accordingly.`;

export const FALLBACK_MESSAGES: {[name: string]: string} = {
  validate: 'Unable to perform validation. Specify what AsyncAPI file should be validated.'
};

export const ARGUMENTS = {
  CONTEXT_NAME: 'context-name',
  SPEC_PATH: 'spec-path',
  CONTEXT: 'context'
};
