import { expect, test } from '@oclif/test';

describe('start', () => {
  afterEach(() => {
    //close the web socket connection
    // ws.close();
    test.command(['stop']).catch(() => {console.log('not working :(');});
  });
  test
    .stderr()
    .stdout()
    .command(['start', 'studio', '--file=./test/specification.yml', '--port=8080'])
    .it('runs studio', (ctx,done) => {
      expect(ctx.stdout).to.contain('Studio is running at http://localhost:8080?liveServer=8080');
    });
});
