import { injectable } from "tsyringe";
import { SpecificationFile, ValidationResponse } from "./models";

import parser from "@asyncapi/parser";

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
