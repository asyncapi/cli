import React from 'react';
import { render } from 'ink-testing-library';
import Validate from "./Validate";
import { Options } from "../../CliModels";
import { UseValidateResponse } from "../../hooks/validation/models";
import chalk from "chalk";
import * as validationHook from '../../hooks/validation';
import { ContextTestingHelper } from '../../constants';



function makeUseValidateReturn(response: UseValidateResponse) {
  jest.spyOn(validationHook, 'useValidate').mockImplementation(() => ({
    validate: () => Promise.resolve(response)
  }));
}

function renderValidationComponentWith(options: Options) {
  return render(<Validate options={options} />);
}

const testing = new ContextTestingHelper();

describe('Validate component should', () => {
  test('render the success message in green color when the specification is correct', (done) => {
    testing.createDummyContextFile();
    const options: Options = {
      context: 'home',
      watch: false,
    };

    const message = 'All good!';
    makeUseValidateReturn(UseValidateResponse.withMessage(message));
    const { lastFrame } = renderValidationComponentWith(options);

    setTimeout(() => {
      expect(lastFrame()).toBe(`${chalk.green(message)}`);
      done();
    }, 200);
  });

  test('render the single error message in red color when the file is not valid', (done) => {
    testing.createDummyContextFile();
    const options: Options = {
      context: 'home',
      watch: false,
    };

    const errorMessage = 'File not found!';
    makeUseValidateReturn(UseValidateResponse.withError(errorMessage));
    const { lastFrame } = renderValidationComponentWith(options);

    setTimeout(() => {
      expect(lastFrame()).toBe(`${chalk.red(errorMessage)}\n`);
      done();
    }, 200);
  });

  test('render the different error messages in red color when the validation fails', (done) => {
    testing.createDummyContextFile();
    const options: Options = {
      context: 'home',
      watch: false,
    };

    const errorMessages = ['Error1', 'Error2'];
    makeUseValidateReturn(UseValidateResponse.withErrors(errorMessages));
    const { lastFrame } = renderValidationComponentWith(options);

    setTimeout(() => {
      expect(lastFrame()).toBe(`${chalk.red(errorMessages[0])}\n${chalk.red(errorMessages[1])}\n`);
      done();
    }, 200);
  });
});
