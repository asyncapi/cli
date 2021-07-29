import { HelpMessageBuilder } from './help-message';

let helpBuilder: HelpMessageBuilder;

describe('HelpMessageBuilder should', () => {
  beforeAll(() => {
    helpBuilder = new HelpMessageBuilder();
  });
  it('return root Help message', () => {
    expect(typeof helpBuilder.showHelp()).toMatch('string');
    expect(helpBuilder.showHelp()).toMatch(
      'usage: asyncapi [options] [command]\n\n'+
      'flags:\n'+
      ' -h, --help  display help for command\n'+
      ' -v, --version  output the version number\n'+
      '\n'+
      'commands:\n'+
      ' validate [options] [command] Validate asyncapi file\n'+
      ' context [options] [command] Manage context\n'
    );
  });

  it('return validate help message', () => {
    expect(typeof helpBuilder.showCommandHelp('validate')).toMatch('string');
  });

  it('return context help message', () => {
    expect(typeof helpBuilder.showCommandHelp('context')).toMatch('string');
  });
});
