type ErrorType = 'parser-error' | 'invalid-file' | 'no-spec-found';

interface IValidationErrorInput {
  type: ErrorType;
  err?: any,
  filepath?: string,
}

export class ValidationError extends Error {
  constructor(error: IValidationErrorInput) {
    super();
    if (error.type === 'parser-error') {
      this.buildError(error.err);
    }
    if (error.type === 'invalid-file') {
      this.message = `❌ There is no file or context with the name "${error.filepath}". Please check the path and try again.`;
    }
    if (error.type === 'no-spec-found') {
      this.message = '❌ Unable to perform validation. Please specify which AsyncAPI file should be validated.';
    }
    this.name = 'ValidationError';
  }
  private buildError(err: any) {
    const errorsInfo: Array<string> = [];

    if (err.title) {
      errorsInfo.push(err.title);
    }

    if (err.detail) {
      errorsInfo.push(err.details);
    }

    if (err.validationErrors) {
      for (const e of err.validationErrors) {
        const errorHasTitle = !!e.title;
        const errorHasLocation = !!e.location;
        /*
        * All the conditions below are needed since validationErrors (from ParserError) come from Parser JS library,
        * so we cannot assure that all the fields or properties are always provided in the error. There might be cases
        * that even title is not provided.
        */
        if (errorHasTitle && errorHasLocation) {
          errorsInfo.push(`${e.title} ${e.location.startLine}:${e.location.startColumn}`);
          continue;
        }
        if (errorHasTitle) {
          errorsInfo.push(`${e.title}`);
          continue;
        }
        if (errorHasLocation) {
          errorsInfo.push(`${e.location.startLine}:${e.location.startColumn}`);
        }
      }
    }
    this.message = errorsInfo.join('\n');
  }
}
