/* eslint-disable no-undef */
/* eslint-disable no-console */
import React from 'react';
import Validate from './components/Validate/Validate';
import { contextRouter } from './components/Context';
import { CliInput } from './CliModels';
import { HelpMessageBuilder } from './help-message';

const commandsDictionary = (cliInput: CliInput): Record<string, any> => ({
  validate: <Validate options={cliInput.options} />,
  context: contextRouter(cliInput)
});

export const commandsRouter = (cli: any): any => {
  const helpMessage = new HelpMessageBuilder();
  const cliInput = CliInput.createFromMeow(cli);
  if (!cliInput.command) {
    return <helpMessage.HelpComponent />;
  }
  if (cliInput.help) {
    console.log(cliInput.command, '- help message');
  }
  return commandsDictionary(cliInput)[cliInput.command];
};
