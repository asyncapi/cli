import {container} from 'tsyringe';
import {CliInput} from '../../../CliModels';
import {ContextComponent} from './component';

const context = container.resolve(ContextComponent);

const commandDictionary = (cliInput: CliInput): Record<string, any> => ({
  list: context.list(),
  current: context.current(),
  add: context.add(cliInput.arguments[0], cliInput.arguments[1]),
  use: context.use(cliInput.arguments[0]),
  remove: context.remove(cliInput.arguments[0])
});

export const contextRouter = (cliInput: CliInput): any => {
  const subCommand = CliInput.createSubCommand(cliInput);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return commandDictionary(subCommand)[subCommand.command!];
};
