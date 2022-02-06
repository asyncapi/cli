import { expect, test } from '@oclif/test';
import inquirer from 'inquirer';

describe('new', () => {
  test
    .stderr()
    .stub(inquirer, 'prompt', () => {
      return Promise.resolve({
        filename: 'specification.yaml',
        template: 'default-example.yaml',
        studio: true,
        port: 3000
      });
    })
    .stdout()
    .command(['new', '--no-tty', '-n=specification.yaml'])
    .it('runs new command', ctx => {
      expect(ctx.stdout).to.contain('specification.yaml');
    });
});
