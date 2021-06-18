import { SpecificationFile, ValidationResponse } from "./models";
import { ValidationService } from "./ValidationService";

import parser, { ParserError } from "@asyncapi/parser";

function AsyncParserMock() {
  return {
    makeThrow: function (error: any) {
      jest.spyOn(parser, 'parse').mockImplementation(() => {
        throw error;
      });
    }
  }
}


describe('ValidationService should', () => {
  const file = new SpecificationFile('test/specification.yml')
  const validationService = new ValidationService();

  test('return a success response if asyncapi/parse does not fail', async () => {
    const response: ValidationResponse = await validationService.execute(file);
    expect(response.success).toBeTruthy();
  });

  test('return success when the validation is correct', async () => {
    AsyncParserMock().makeThrow(new ParserError({ title: '', type: '', detail: 'Error Thrown' }));

    const response: ValidationResponse = await validationService.execute(file);
    expect(response.success).toBeFalsy();
  });
});
