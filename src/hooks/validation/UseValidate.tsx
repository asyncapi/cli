import { inject, injectable } from "tsyringe";

import { ValidationInput } from "./models";
import { ValidationService } from "./ValidationService";

@injectable()
export class UseValidate {

  constructor(@inject(ValidationService) private validationService: ValidationService) {}

  async validate({ file }: ValidationInput): Promise<any> {
    try {
      if (file.isNotAFile()) {
        return Promise.resolve(`File: ${file.getFileName()} - does not exists or is not a file!`);
      }
      return Promise.resolve(await this.validationService.execute(file));
    } catch (error) {
      return Promise.resolve(error);
    }
  }
}
