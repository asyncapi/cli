import { container } from 'tsyringe';
import { SpecificationFile, ValidationInput, ValidationResponse } from './models';
import { ValidationService } from './ValidationService';
import { useValidate } from './hook';
import {ValidationMessage} from '../../messages';

function ValidationServiceMock() {
  return {
    makeReturn (response: ValidationResponse) {
      container.registerInstance(ValidationService, {
        execute () {
          return Promise.resolve(response);
        }
      });
    },
    makeThrow (error: any) {
      container.registerInstance(ValidationService, {
        execute () {
          throw error;
        }
      });
    }
  };
}

describe('UseValidate should', () => {
  const invalidFileValidationInput: ValidationInput = {
    file: new SpecificationFile('oneFileThatNotExists.yml'),
    watchMode: false,
  };

  const fileThatExistsValidationInput: ValidationInput = {
    // NOTE: Here we only need a file that exists from the project's root path
    file: new SpecificationFile('test/specification.yml'),
    watchMode: false,
  };

  test('return an error when the file is not valid', async () => {
    const useValidateResponse = await useValidate().validate(invalidFileValidationInput);

    expect(useValidateResponse.success).toBeFalsy();
    expect(useValidateResponse.message).toEqual('');

    expect(useValidateResponse.errors[0]).toBe(ValidationMessage(invalidFileValidationInput.file.getSpecificationName()).error());
  });

  test('return success when the validation is correct', async () => {
    ValidationServiceMock().makeReturn(ValidationResponse.createSuccess());

    const useValidateResponse = await useValidate().validate(fileThatExistsValidationInput);
    expect(useValidateResponse.success).toBeTruthy();
    expect(useValidateResponse.message).toEqual(ValidationMessage(fileThatExistsValidationInput.file.getSpecificationName()).message());
  });

  test('return validation service errors when the validation has failed', async () => {
    ValidationServiceMock().makeReturn(ValidationResponse.createError({ detail: 'Error in validation' }));

    const useValidateResponse = await useValidate().validate(fileThatExistsValidationInput);
    expect(useValidateResponse.success).toBeFalsy();
    expect(useValidateResponse.errors[0]).toEqual('Error in validation');
  });

  test('return error message when the validation service throws an exception', async () => {
    ValidationServiceMock().makeThrow(new Error('Error Thrown'));

    const useValidateResponse = await useValidate().validate(fileThatExistsValidationInput);
    expect(useValidateResponse.success).toBeFalsy();
    expect(useValidateResponse.errors[0]).toEqual('Error Thrown');
  });
});
