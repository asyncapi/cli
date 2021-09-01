import React from 'react';
import Validate from './components/Validate/Validate';
import { contextRouter } from './components/Context';
import { CliInput } from './CliModels';
import { CommandName, HelpMessageBuilder } from './help-message';

const commandsDictionary = (cliInput: CliInput): Record<string, any> => ({
  validate: <Validate options={cliInput.options} parameter={cliInput.arguments[0]} />,
  context: contextRouter(cliInput)
});

export const commandsRouter = (cli: any): any => {
  const helpMessage = new HelpMessageBuilder();
  const cliInput = CliInput.createFromMeow(cli);
  if (!cliInput.command) {
    return <helpMessage.HelpComponent />;
  }
  if (cliInput.help) {
    return <helpMessage.HelpComponent command={cliInput.command as CommandName} />;
  }
  return commandsDictionary(cliInput)[cliInput.command];
};
