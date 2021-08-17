import { CLIService } from './service';
import { container } from 'tsyringe';

export interface useCliOutput {
  command: string,
  args: any
}

export const useCli = (): useCliOutput => {
  const cliService: CLIService = container.resolve(CLIService);
  return { command: cliService.command(), args: cliService.args() };
};
