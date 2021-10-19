import 'reflect-metadata';
import { test, expect } from '@oclif/test';
import { ValidationMessage } from '../../src/messages';
import * as path from 'path';
import { describe } from 'mocha';

describe('Validation Command ', () => {
  test
    .stdout()
    .stderr()
    .command(['validate', './test/specification.yml'])
    .it('should validate successfully', async (ctx) => {
      expect(ctx.stdout).to.contain(ValidationMessage(
        path.resolve(process.cwd(), './test/specification.yml')
      ).message());
    });

  test
    .stdout()
    .command(['config', 'context', 'list'])
    .it('should list all contexts', ctx => {
      expect(ctx.stdout).to.contain('test: ./test/specification.yml\ncheck: C:\\Users\\Souvi\\Documents\\Programs\\Forked_Projects\\cli\\test\\specification.yml\n');
    });
});
