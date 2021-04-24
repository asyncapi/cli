import React from 'react';
import { render } from 'ink-testing-library';
import Validate from "./Validate";
import { Options } from "../../CliModels";


function renderValidationComponentWith(options: Options) {
  return render(<Validate options={options}/>);
}

describe('Validate component should', () => {
  test('a simple text', () => {
    const options: Options = {
      context: 'peter',
      watch: false,
    };
    const { lastFrame } = renderValidationComponentWith(options);
    expect(lastFrame()).toBe(`Validation Component\n` +
                             `With context ${options.context}\n` +
                             `With watchMode ${options.watch}`);
  });
});
