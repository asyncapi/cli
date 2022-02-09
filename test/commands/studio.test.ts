import { expect, test } from '@oclif/test';
import { start as startStudio } from '../../src/models/Studio';
// import inquirer from 'inquirer';

//test web socket server connection
describe('start', () => {
    test
        .stderr()
        .stdout()
        .do(() => {
            startStudio('./test/specification.yml', 8080);
        })
        .command(['start', 'studio'])
        .it('runs studio', ctx => {
            expect(ctx.stdout).to.contain('Studio is running at http://localhost:8080?liveServer=8080');
        });
});