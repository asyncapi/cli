type ErrorType = 'parser-error' | 'invalid-file';

interface IValidationErrorInput {
  type: ErrorType;
  err?: any,
  filepath?: string
}

import { ValidationMessage } from '../messages';

export class ValidationError extends Error {
  constructor(error: IValidationErrorInput) {
    super();
    if (error.type === 'parser-error') {
      this.buildError(error.err);
    }
    if (error.type === 'invalid-file') {
      this.name = ValidationMessage(error.filepath as string).error();
    }
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
