import React from 'react';
import {container} from 'tsyringe';
import {CliInput} from '../../../CliModels';
import {ContextComponent} from './component';

const context = container.resolve(ContextComponent);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const commandDictionary = (_cliInput: CliInput): Record<string, any> => ({
  list: <context.list />
});

export const contextRouter = (cliInput: CliInput): any => {
  const subCommand = CliInput.createSubCommand(cliInput);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return commandDictionary(subCommand)[subCommand.command!];
};
