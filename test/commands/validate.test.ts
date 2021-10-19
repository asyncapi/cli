import 'reflect-metadata';
import {test, expect} from '@oclif/test';

describe('Validate Command ', () => {
  test
    .stdout()
    .command(['validate', './test/specification.yml'])
    .it('should validate successfully', (ctx) => {
      console.log(ctx);
      expect(ctx.stdout).to.contain('');
    });
});
