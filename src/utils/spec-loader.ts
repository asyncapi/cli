/* eslint-disable security/detect-object-injection */
/* eslint-disable sonarjs/no-collapsible-if */
/* eslint-disable no-undef */
import { container } from 'tsyringe';
import { ContextService } from '../hooks/context/contextService';
import { Context, NoSpecPathFoundError } from '../hooks/context';
import { CLIService } from '../hooks/cli';
import { SpecificationFile } from '../hooks/validation';

const loadContext = () => {
  let ctx = undefined;
  const contextService = container.resolve(ContextService);
  const isContext = contextService.isContext();

  try {
    ctx = contextService.loadContextFile();
  } catch (error) {
    ctx = undefined;
  }

  return {
    isContext,
    contextService,
    ctx
  };
};

const loadSpec = (ctx: Context | undefined) => {
  if (!ctx) {
    return autoDetectSpecFile();
  }
  try {
    if (!ctx.current) { return autoDetectSpecFile(); }
    return new SpecificationFile(ctx.store[ctx.current] as string);
  } catch (error) {
    return error;
  }
};

/**
 * 
 * not considering the case where the context file does not exits. 
 */
const autoDetectSpecFile = () => {
  const contextService = container.resolve(ContextService);
  const cliService = container.resolve(CLIService);
  const specFile = contextService.autoDetectSpecFile();
  if (typeof specFile === 'undefined') { throw new NoSpecPathFoundError(cliService.command()); }
  return new SpecificationFile(specFile);
};

// const isFile = (filePath: string) => {
//   return fs.existsSync(filePath) || fs.lstatSync(filePath).isFile();
// };

// const isURL = (url: string) => {
//   try {
//     const validUrl = new URL(url);
//     return validUrl.protocol === 'http:' || validUrl.protocol === 'https:';
//   } catch (error) {
//     return false;
//   }
// };

export interface ValidateInput {
  specFile?: SpecificationFile,
  error?: Error | string
}

export const loadSpecFileForValidate = (input?: string): ValidateInput => {
  /**
   * Steps to complete this 
   * - if no input then we auto load specfile according to the context
   * - if input then we figure out if it is a file, url or context and load 
   * specfile accordingly
   */
  const { ctx } = loadContext();
  let specFile;
  if (!input) {
    specFile = loadSpec(ctx);
    return {specFile};
  }

  if (ctx) {
    if (Object.keys(ctx.store).includes(input)) {
      specFile = new SpecificationFile(ctx.store[input] as string);
      return {specFile};
    }
  }

  specFile = new SpecificationFile(input);

  if (specFile.isNotValid()) {
    const error = 'Invalid';
    return { error };
  }

  return { specFile };
};
