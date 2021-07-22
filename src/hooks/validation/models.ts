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
  private readonly _success: boolean;
  private readonly _errors: Array<string>;

  constructor(success: boolean, errorsInfo: string[] = []) {
    this._success = success;
    this._errors = errorsInfo;
  }

  get success(): boolean {
    return this._success;
  }

  get errors(): Array<string> {
    return this._errors;
  }

  public static createSuccess(): ValidationResponse {
    return new ValidationResponse(true);
  }

  public static createError(err: any): ValidationResponse {
    const errorsInfo: Array<string> = [];

    if (err.title) {
      errorsInfo.push(err.title);
    }
    if (err.detail) {
      errorsInfo.push(err.detail);
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
    return new ValidationResponse(false, errorsInfo);
  }
}

export class UseValidateResponse {
  private readonly _success: boolean;
  private readonly _errors: Array<string>;
  private readonly _message: string;

  constructor(message: string, success = true, errors: Array<string> = []) {
    this._message = message;
    this._success = success;
    this._errors = errors;
  }

  get success(): boolean {
    return this._success;
  }

  get errors(): Array<string> {
    return this._errors;
  }

  get message(): string {
    return this._message;
  }

  public static withMessage(message: string): UseValidateResponse {
    return new UseValidateResponse(message);
  }

  public static withErrors(errors: Array<string>): UseValidateResponse {
    return new UseValidateResponse('', false, errors);
  }

  public static withError(error: string): UseValidateResponse {
    const errors = [];
    errors.push(error);
    return new UseValidateResponse('', false, errors);
  }
}

export interface ValidationInput {
  file: SpecificationFile;
  watchMode: WatchFlag;
}
