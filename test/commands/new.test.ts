import { expect, test } from '@oclif/test';
import TestHelper from '../testHelper';

const testHelper = new TestHelper();

describe('new', () => {
    describe('file-name', () => {
        afterEach(() => {
            testHelper.deleteDummyContextFile();
        });
        beforeEach(() => {
            testHelper.createDummyContextFile();
        });
        test
            .stderr()
            .stdout()
            .command(['new', '--file-name', 'test'])
            .it('creates a new asyncapi file', (ctx, done) => {
                expect(ctx.stdout).to.equals(
                    'Created new file "test".\n'
                );
                expect(ctx.stderr).to.equals('');
                done();
            }
            );
    });
});