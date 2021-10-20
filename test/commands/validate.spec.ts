import ValidateCommand from '../../src/commands/validate';
import { ValidationMessage } from '../../src/messages';
import { ContextTestingHelper } from '../../src/constants';
import * as path from 'path';

const contextTestingHelper = new ContextTestingHelper();

describe('validate command ', () => {
  let message: string;
  beforeEach(() => {
    message = '';
    jest.spyOn(process.stdout, 'write')
      .mockImplementation(val => {
        message = val;
        return true;
      });
  });

  afterEach(() => jest.resetAllMocks());

  test('should validate if correct path is passed', async () => {
    await ValidateCommand.run(['./test/specification.yml']);
    expect(message).toMatch(ValidationMessage(
      path.resolve(process.cwd(), './test/specification.yml')
    ).message());
  });

  test('should print error message if file does not exists', async () => {
    await ValidateCommand.run(['./test/spec.yml']);
    console.log('message',message);
  });
});

