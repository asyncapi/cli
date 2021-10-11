import { ValidationMessage, NO_SPEC_FOUND } from '../messages';

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
      this.message = ValidationMessage(error.filepath as string).error();
    }
    if (error.type === 'no-spec-found') {
      this.message = NO_SPEC_FOUND('validate');
    }
    this.name = 'Validation Error';
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
        if (errorHasLocation) {
          errorsInfo.push(`${e.title} ${e.location.startLine}:${e.location.startColumn}`);
        }
        if (errorHasTitle) {
          errorsInfo.push(`${e.title}`);
        }
      }
    }

    this.message = errorsInfo.join('\n');
  }
}
