import React from 'react';
import {container} from 'tsyringe';
import {CliInput} from '../../../CliModels';
import {ContextComponent} from './component';

const context = container.resolve(ContextComponent);

const commandDictionary = (cliInput: CliInput): Record<string, any> => ({
  list: context.list(),
  current: context.current(),
  add: <context.add contextName={cliInput.arguments[0]} specPath={cliInput.arguments[1]} />,
  use: <context.use contextName={cliInput.arguments[0]} />,
  remove: <context.remove contextName={cliInput.arguments[0]} />
});

export const contextRouter = (cliInput: CliInput): any => {
  const subCommand = CliInput.createSubCommand(cliInput);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return commandDictionary(subCommand)[subCommand.command!];
};
