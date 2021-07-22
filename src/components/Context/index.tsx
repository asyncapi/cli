/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { CliInput } from '../../CliModels';
import { ListContexts,AddContext,RemoveContext,ShowCurrentContext,SetCurrent } from './Context';

//@ts-ignore
const commandDictionary = (cliInput: CliInput) => ({
  ['list']: <ListContexts />,
  ['current']: <ShowCurrentContext />,
  ['use']: <SetCurrent options={cliInput.options} args={cliInput.arguments} />,
  ['add']: <AddContext options={cliInput.options} args={cliInput.arguments} />,
  ['remove']: <RemoveContext options={cliInput.options} args={cliInput.arguments} />
});

export const contextRouter = (cliInput: CliInput) => {
  const subCommand = CliInput.createSubCommand(cliInput);
  //@ts-ignore
  return commandDictionary(subCommand)[subCommand.command];
};
