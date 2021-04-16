import { container } from "tsyringe";

import { ValidationInput } from "./models";
import { ValidationService } from "./ValidationService";

export function useValidate() {
  const validationService: ValidationService = container.resolve(ValidationService);

  return {
    validate: async function ({ file }: ValidationInput): Promise<any> {
      try {
        if (file.isNotAFile()) {
          return Promise.resolve(`File: ${file.getFileName()} - does not exists or is not a file!`);
        }
        return Promise.resolve(await validationService.execute(file));
      } catch (error) {
        return Promise.resolve(error);
      }
    }
  }
}
