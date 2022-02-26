import { expect, test } from '@oclif/test';
import {execSync} from 'child_process';

describe('start', () => {
  after(() => {
    setTimeout(() => {
      execSync('npx kill-port 8080');
    }, 10000);
  });   
  test
    .stderr()
    .stdout()
    .command(['start', 'studio', '--file=./test/specification.yml', '--port=8080'])
    .it('runs studio', ctx => {
      expect(ctx.stdout).to.contain('Studio is running at http://localhost:8080?liveServer=8080');
    });

  test
    .stdout()
    .command(['npm','run','stop'])
    .catch(() => {
      console.log('not working :(');
    });   
});
