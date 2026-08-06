type ErrorType =
  | 'parser-error'
  | 'invalid-file'
  | 'no-spec-found'
  | 'invalid-syntax-file';

interface IValidationErrorInput {
  type: ErrorType;
  err?: any;
  filepath?: string;
}

export class ValidationError extends Error {
  constructor(error: IValidationErrorInput) {
    super();
    if (error.type === 'parser-error') {
      this.buildError(error.err);
    }
    if (error.type === 'invalid-file') {
      this.message = `There is no file or context with name "${error.filepath}".`;
    }
    if (error.type === 'invalid-syntax-file') {
      this.message = `Syntax Error in "${error.filepath}".`;
    }
    if (error.type === 'no-spec-found') {
      this.message =
        'Unable to perform validation. Specify what AsyncAPI file should be validated.\n\nThese are your options to specify in the CLI what AsyncAPI file should be used:\n- You can provide a path to the AsyncAPI file: asyncapi validate path/to/file/asyncapi.yml\n- You can also pass a saved context that points to your AsyncAPI file: asyncapi validate mycontext\n- In case you did not specify a context that you want to use, the CLI checks if there is a default context and uses it. To set default context run: asyncapi context use mycontext\n- In case you did not provide any reference to AsyncAPI file and there is no default context, the CLI detects if in your current working directory you have files like asyncapi.json, asyncapi.yaml, asyncapi.yml. Just rename your file accordingly.';
    }
    this.name = 'ValidationError';
  }

  private buildError(err: any) {
    const errorsInfo = collectParserErrorInfo(err);

    if (errorsInfo.length > 0) {
      this.message = errorsInfo.join('\n');
      return;
    }

    // Fallback for error shapes that don't follow the @asyncapi/parser
    // ParserError contract (plain strings, generic Errors, undefined): surface
    // the most informative non-empty value we can find so callers never see a
    // bare "ValidationError:" with no diagnostic body.
    this.message =
      (typeof err === 'string' && err) ||
      err?.message ||
      err?.title ||
      'Unknown parser error';
  }
}

function collectParserErrorInfo(err: any): string[] {
  const errorsInfo: string[] = [];

  if (!err) {
    return errorsInfo;
  }

  if (err.title) {
    errorsInfo.push(err.title);
  }

  if (err.detail) {
    errorsInfo.push(err.details);
  }

  if (err.validationErrors) {
    for (const e of err.validationErrors) {
      const formatted = formatValidationError(e);
      if (formatted) {
        errorsInfo.push(formatted);
      }
    }
  }

  return errorsInfo;
}

/*
 * Format a single ParserError validationErrors entry. All fields are
 * defensive: validationErrors come from the @asyncapi/parser JS library and
 * are not guaranteed to provide a title or a location.
 */
function formatValidationError(e: any): string | undefined {
  const errorHasTitle = !!e.title;
  const errorHasLocation = !!e.location;

  if (errorHasTitle && errorHasLocation) {
    return `${e.title} ${e.location.startLine}:${e.location.startColumn}`;
  }
  if (errorHasTitle) {
    return `${e.title}`;
  }
  if (errorHasLocation) {
    return `${e.location.startLine}:${e.location.startColumn}`;
  }
  return undefined;
}
