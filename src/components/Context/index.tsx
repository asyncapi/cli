/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';

import { ListContexts,AddContext,RemoveContext,ShowCurrentContext,SetCurrent } from './Context';
import { CliInput } from '../../CliModels';

const commandDictionary = (cliInput: CliInput): Record<string, any> => ({
  list: <ListContexts />,
  current: <ShowCurrentContext />,
  use: <SetCurrent options={cliInput.options} args={cliInput.arguments} />,
  add: <AddContext options={cliInput.options} args={cliInput.arguments} />,
  remove: <RemoveContext options={cliInput.options} args={cliInput.arguments} />
});

export const contextRouter = (cliInput: CliInput): any => {
  const subCommand = CliInput.createSubCommand(cliInput);
  return commandDictionary(subCommand)[subCommand.command!];
};
