import * as fs from 'fs';
import * as path from 'path';

interface Specification {
  isNotValid(): boolean;
  read(): string;
  getSpecificationName(): string;
}

export class SpecificationFile implements Specification {
  private readonly name: string;

  constructor(name: string) {
    const localDirectory = process.cwd();
    this.name = path.resolve(localDirectory, name);
  }

  isNotValid(): boolean {
    return !fs.existsSync(this.name) || !fs.lstatSync(this.name).isFile();
  }

  read(): string {
    return fs.readFileSync(this.name, 'utf8');
  }

  getSpecificationName(): string {
    return this.name;
  }
}

export type WatchFlag = boolean;

export class ValidationResponse {
  private readonly _success: Boolean;
  private readonly _errors: Array<String>;

  constructor(success: Boolean, errorsInfo: String[] = []) {
    this._success = success;
    this._errors = errorsInfo;
  }

  get success(): Boolean {
    return this._success;
  }

  get errors(): Array<String> {
    return this._errors;
  }

  public static createSuccess(): ValidationResponse {
    return new ValidationResponse(true);
  }

  public static createError(err: any): ValidationResponse {
    const errorsInfo: Array<String> = [];

    if (err.title) {
      errorsInfo.push(err.title);
    }
    if (err.detail) {
      errorsInfo.push(err.detail);
    }
    if (err.validationErrors) {
      err.validationErrors.forEach((e: any) => {
        const errorHasTitle = !!e.title
        const errorHasLocation = !!e.location;
        if (errorHasLocation) {
          return errorsInfo.push(`${e.title} ${e.location.startLine}:${e.location.startColumn}`);
        }
        if (errorHasTitle) {
          return errorsInfo.push(`${e.title}`);
        }
        return errorsInfo;
      });
    }
    return new ValidationResponse(false, errorsInfo);
  }
}

export class UseValidateResponse {
  private readonly _success: Boolean;
  private readonly _errors: Array<String>;
  private readonly _message: String;

  constructor(message: String, success: Boolean = true, errors: Array<String> = []) {
    this._message = message;
    this._success = success;
    this._errors = errors;
  }

  get success(): Boolean {
    return this._success;
  }

  get errors(): Array<String> {
    return this._errors;
  }

  get message(): String {
    return this._message;
  }

  public static withMessage(message: String): UseValidateResponse {
    return new UseValidateResponse(message);
  }

  public static withErrors(errors: Array<String>): UseValidateResponse {
    return new UseValidateResponse('', false, errors);
  }

  public static withError(error: String): UseValidateResponse {
    const errors = [];
    errors.push(error);
    return new UseValidateResponse('', false, errors);
  }
}

export interface ValidationInput {
  file: SpecificationFile;
  watchMode: WatchFlag;
}
