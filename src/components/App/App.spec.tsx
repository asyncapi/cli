import React from 'react';
import { render } from 'ink-testing-library';
import App from './App';
import chalk from "chalk";


function renderAppWith(file: string, watch: boolean) {
  return render(<App context={ { file, watch } }/>);
}

describe('App should', () => {
  test('Display file with watchMode enabled', () => {
    const { lastFrame } = renderAppWith("/Jane/peter.yaml", true);
    expect(lastFrame()).toBe(`${chalk.green('/Jane/peter.yaml')} with watchMode ${chalk.green('Enabled')}`);
  });

  test('Display file with watchMode disabled', () => {
    const { lastFrame } = renderAppWith("/Jane/peter.yaml", false);
    expect(lastFrame()).toBe(`${chalk.green('/Jane/peter.yaml')} with watchMode ${chalk.red('Disabled')}`);
  });
});
