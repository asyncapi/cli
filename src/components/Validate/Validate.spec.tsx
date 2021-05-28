import React from 'react';
import { render } from 'ink-testing-library';
import Validate from "./Validate";
import { Options } from "../../CliModels";
import { UseValidateResponse } from "../../hooks/validation/models";
import chalk from "chalk";
import * as validationHook from '../../hooks/validation';


function makeUseValidateReturn(response: UseValidateResponse) {
  jest.spyOn(validationHook, 'useValidate').mockImplementation(() => ({
    validate: () => Promise.resolve(response)
  }));
}

function renderValidationComponentWith(options: Options) {
  return render(<Validate options={options}/>);
}

describe('Validate component should', () => {
  test('render the success message in green color when the specification is correct', (done) => {
    const options: Options = {
      context: 'oneFile.yml',
      watch: false,
    };

    makeUseValidateReturn(UseValidateResponse.withMessage('All good!'));
    const { lastFrame } = renderValidationComponentWith(options);

    setTimeout(() => {
      expect(lastFrame()).toBe(`${chalk.green('All good!')}`);
      done();
    }, 200);
  });

  test('render the single error message in red color when the file is not valid', (done) => {
    const options: Options = {
      context: 'oneFile.yml',
      watch: false,
    };

    makeUseValidateReturn(UseValidateResponse.withError('File not found!'));
    const { lastFrame } = renderValidationComponentWith(options);

    setTimeout(() => {
      expect(lastFrame()).toBe(`${chalk.red('File not found!')}\n`);
      done();
    }, 200);
  });

  test('render the different error messages in red color when the validation fails', (done) => {
    const options: Options = {
      context: 'oneFile.yml',
      watch: false,
    };

    makeUseValidateReturn(UseValidateResponse.withErrors(['Error1', 'Error2']));
    const { lastFrame } = renderValidationComponentWith(options);

    setTimeout(() => {
      expect(lastFrame()).toBe(`${chalk.red('Error1')}\n${chalk.red('Error2')}\n`);
      done();
    }, 200);
  });
});
