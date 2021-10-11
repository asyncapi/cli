import { injectable } from 'tsyringe';
import { SpecificationFile } from '../models';
import parser from '@asyncapi/parser';
import { ValidationError } from '../errors/validation-error';
import { ValidationMessage } from '../messages';

@injectable()
export class ValidationService {
  async validate(file: SpecificationFile) {
    if (file.isNotValid()) {
      throw new ValidationError({
        type: 'invalid-file',
        filepath: file.getSpecificationName()
      });
    }
    try {
      await parser.parse(file.read());
      return ValidationMessage(file.getSpecificationName()).message();
    } catch (error) {
      throw new ValidationError({
        type: 'parser-error',
        err: error
      });
    }
  }
}
