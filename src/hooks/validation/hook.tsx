import { container } from 'tsyringe';

import { UseValidateResponse, ValidationInput, ValidationResponse } from './models';
import { ValidationService } from './ValidationService';
import { ValidationMessage } from '../../messages';

export function useValidate() {
  const validationService: ValidationService = container.resolve(ValidationService);

  return {
    async validate({ file }: ValidationInput): Promise<UseValidateResponse> {
      try {
        if (file.isNotValid()) {
          return Promise.resolve(UseValidateResponse.withError(ValidationMessage(file.getSpecificationName()).error()));
        }
        const response: ValidationResponse = await validationService.execute(file);
        if (response.success) {
          return Promise.resolve(UseValidateResponse.withMessage(ValidationMessage(file.getSpecificationName()).message()));
        }
        return Promise.resolve(UseValidateResponse.withErrors(response.errors));
      } catch (error) {
        return Promise.resolve(UseValidateResponse.withError(error.message));
      }
    }
  };
}
