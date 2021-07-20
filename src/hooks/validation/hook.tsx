/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { container } from 'tsyringe';

import { UseValidateResponse, ValidationInput, ValidationResponse } from './models';
import { ValidationService } from './ValidationService';

export function useValidate() {
  const validationService: ValidationService = container.resolve(ValidationService);

  return {
    // @ts-ignore
    async validate({ file }: ValidationInput): Promise<UseValidateResponse> {
      try {
        if (file.isNotValid()) {
          return Promise.resolve(UseValidateResponse.withError(`File: ${file.getSpecificationName()} does not exists or is not a file!`));
        }
        const response: ValidationResponse = await validationService.execute(file);
        if (response.success) {
          return Promise.resolve(UseValidateResponse.withMessage(`File: ${file.getSpecificationName()} successfully validated!`));
        }
        return Promise.resolve(UseValidateResponse.withErrors(response.errors));
      } catch (error) {
        return Promise.resolve(UseValidateResponse.withError(error.message));
      }
    }
  };
}
