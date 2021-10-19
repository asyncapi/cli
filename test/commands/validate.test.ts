import 'reflect-metadata';
import {test} from '@oclif/test';

describe('Validate Command ', () => {
  test
    .stdout()
    .command(['validate ./test/specification.yml'])
    .it('should validate successfully', ctx => {
      console.log(ctx.stdout);
    });
});
