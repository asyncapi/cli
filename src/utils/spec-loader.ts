/* eslint-disable no-undef */
import { container } from 'tsyringe';
import { ContextService } from '../hooks/context/contextService';
import { Context, NoSpecPathFoundError } from '../hooks/context';
import { CLIService } from '../hooks/cli';
import { SpecificationFile } from '../hooks/validation';
import * as fs from 'fs';

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

const autoDetectSpecFile = () => {
  const contextService = container.resolve(ContextService);
  const cliService = container.resolve(CLIService);
  const specFile = contextService.autoDetectSpecFile();
  if (typeof specFile === 'undefined') { throw new NoSpecPathFoundError(cliService.command()); }
  return new SpecificationFile(specFile);
};

const isFile = (filePath: string) => {
  return fs.existsSync(filePath) || fs.lstatSync(filePath).isFile();
};

const isURL = (url: string) => {
  try {
    const validUrl = new URL(url);
    return validUrl.protocol === 'http:' || validUrl.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

export const loadSpecFileForValidate = (input?: string) => {
  /**
   * Steps to complete this 
   * - if no input then we auto load specfile according to the context
   * - if input then we figure out if it is a file, url or context and load 
   * specfile accordingly
   */
  const { ctx } = loadContext();
  if (!input) {
    return loadSpec(ctx);
  }

  if (isFile(input)) {
    return new SpecificationFile(input);
  }

  if (isURL(input)) {
    return new SpecificationFile(input);
  }

  return new SpecificationFile(ctx?.store[input] as string);
};
