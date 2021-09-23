import {contextRouter} from './context/router';

import {CliInput} from '../../CliModels';

const commandDictionary = (cliInput: CliInput): Record<string, any> => ({
  context: contextRouter(cliInput)
});

export const configRouter = (cliInput: CliInput): any => {
  const subCommand = CliInput.createSubCommand(cliInput);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return commandDictionary(subCommand)[subCommand.command!];
};
