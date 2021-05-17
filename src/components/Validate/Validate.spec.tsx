import React from 'react';
import { render } from 'ink-testing-library';
import Validate from "./Validate";
import { Options } from "../../CliModels";
import { ValidationResponse } from "../../hooks/validation/models";
import { container } from "tsyringe";
import { ValidationService } from "../../hooks/validation/ValidationService";


function makeValidationServiceReturn(response: ValidationResponse) {
  container.registerInstance(ValidationService, {
    execute: function () {
      return Promise.resolve(response);
    }
  });
}

function renderValidationComponentWith(options: Options) {
  return render(<Validate options={options}/>);
}

describe('Validate component should', () => {
  test('render the success message in green color', () => {

    makeValidationServiceReturn(ValidationResponse.createSuccess());

    const options: Options = {
      context: 'oneFile.yml',
      watch: false,
    };
    const { lastFrame } = renderValidationComponentWith(options);
    expect(lastFrame()).toBe(`File: /home/jorgengo/dev/asyncapi/cli/test/specification.yml - was validated successfully!`);
  });
});
