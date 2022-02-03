import { expect, test } from '@oclif/test';
import inquirer from 'inquirer';
import TestHelper from '../testHelper';

const testHelper = new TestHelper();

const DEFAULT_ASYNCAPI_FILE_NAME = 'asyncapi.yaml';
const DEFAULT_ASYNCAPI_TEMPLATE = 'default-example.yaml';

describe('new', () => {
    test
        .stderr()
        .stub(inquirer, 'prompt', () => {
            return Promise.resolve({
                filename: 'specification.yaml',
                template: 'default-example.yaml',
                studio: true,
                port: 3000
            })
        })
        .stdout()
        .do(() => {
            testHelper.createAsyncapiFile(DEFAULT_ASYNCAPI_FILE_NAME, DEFAULT_ASYNCAPI_TEMPLATE);
        })
        .command(['new'])
        .it('runs new command', ctx => {
            expect(ctx.stdout).to.contain('specification.yaml');
        });
});