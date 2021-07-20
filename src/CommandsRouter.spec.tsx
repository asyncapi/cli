import { render } from 'ink-testing-library';
import { commandsRouter } from './CommandsRouter';
import { SpecificationFile } from './hooks/validation';
import chalk from 'chalk';

function renderAux(cli: any) {
  return render(commandsRouter(cli));
}

describe('CommandsRouter should', () => {
  test('route to validate component when validate command passed', (done) => {
    const { lastFrame } = renderAux({
      input: ['validate'],
      help: 'Help Message',
      flags: {
        context: 'test/specification.yml',
        watch: false,
      },
    });

    // NOTE: This is needed to be able to match the test result file name due to its dependency with the file system
    const file = new SpecificationFile('test/specification.yml');

    setTimeout(() => {
      expect(lastFrame()).toBe(chalk.green(`File: ${file.getSpecificationName()} successfully validated!`));
    }, 200);
    done();
  });
});
