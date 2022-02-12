import { command, expect, test } from '@oclif/test';
// import { WebSocket } from 'ws';

describe('start', () => {
    afterEach(() => {
        // WebSocket.close();
    });
    test
        .stderr()
        .stdout()
        .command(['start', 'studio', '--file=./test/specification.yml', '--port=8080'])
        .it('runs studio', ctx => {
            expect(ctx.stdout).to.contain('Studio is running at http://localhost:8080?liveServer=8080');
        });
});