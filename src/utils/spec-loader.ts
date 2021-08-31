import { container } from 'tsyringe';
import { ContextService } from '../hooks/context/contextService';
import { Context, NoSpecPathFoundError } from '../hooks/context';
import { CLIService } from '../hooks/cli';
import { SpecificationFile } from '../hooks/validation';
import * as fs from 'fs';

const loadSpec = () => {
  const contextService: ContextService = container.resolve(ContextService);
  const cliService: CLIService = container.resolve(CLIService);
  const ctx: Context = contextService.loadContextFile();
  if (!ctx.current) {
    return autoDetectSpecFile(contextService.autoDetectSpecFile(),cliService.command());
  }
  return new SpecificationFile(ctx.store[ctx.current] as string);
};

const autoDetectSpecFile = (specFile: string | undefined, command: string) => {
  if (typeof specFile === 'undefined') { throw new NoSpecPathFoundError(command);}
  return new SpecificationFile(specFile);
};

const isFile = (filePath: string) => {
  return fs.existsSync(filePath) || fs.lstatSync(filePath).isFile();
};

const isURL = (url: string) => {
  return url;
};

export const loadSpecFileForValidate = (input?: string) => {
  /**
   * Steps to complete this 
   * - if no input then we auto load specfile according to the context
   * - if input then we figure out if it is a file, url or context and load 
   * specfile accordingly
   */
  if (!input) {
    return loadSpec();
  }

  if (isFile(input)) {
    return new SpecificationFile(input);
  }

  if (isURL(input)) {
    return new SpecificationFile(input);
  }

  return new SpecificationFile(input);
};
