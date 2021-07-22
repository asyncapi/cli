import parser from '@asyncapi/parser';
import { injectable } from 'tsyringe';

import { SpecificationFile, ValidationResponse } from './models';

@injectable()
export class ValidationService {
  async execute(file: SpecificationFile): Promise<ValidationResponse> {
    try {
      await parser.parse(file.read());
      return Promise.resolve(ValidationResponse.createSuccess());
    } catch (err) {
      return Promise.resolve(ValidationResponse.createError(err));
    }
  }
}
