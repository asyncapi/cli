import { Context, ContextFileNotFoundError, ContextNotFoundError, MissingCurrentContextError } from './models';
import { ContextService } from './contextService';
import { container } from 'tsyringe';
import { SpecificationFile } from '../validation';
import * as messages from '../../messages';

export type Result = {
  response?: any,
  error?: Error
}

export const useContextFile = (): any => {
  const contextService: ContextService = container.resolve(ContextService);

  return {
    list: (): Result => {
      try {
        const ctx: Context = contextService.loadContextFile();
        const response = Object.keys(ctx.store).map(c => ({ key: c, path: ctx.store[String(c)] }));
        return { response };
      } catch (error) {
        return { error };
      }
    },
    current: (): Result => {
      try {
        const ctx: Context = contextService.loadContextFile();
        if (!ctx.current) { throw new MissingCurrentContextError(); }
        const response = { key: ctx.current, path: ctx.store[ctx.current] };
        return { response };
      } catch (error) {
        return { error };
      }
    },
    addContext: (key: string, specFile: SpecificationFile): Result => {
      try {
        const ctx = contextService.loadContextFile();
        const updatedContext = contextService.addContext(ctx, key, specFile);
        contextService.save(updatedContext);
        const response = messages.NEW_CONTEXT_ADDED(key);
        return { response };
      } catch (error) {
        if (error instanceof ContextFileNotFoundError) {
          const context: Context = { current: '', store: {} };
          try {
            const newContext = contextService.addContext(context, key, specFile);
            contextService.save(contextService.updateCurrent(newContext, key));
            const response = messages.NEW_CONTEXT_ADDED(key);
            return { response };
          } catch (error) {
            return { error };
          }
        }
        return { error };
      }
    },
    setCurrent: (key: string): Result => {
      try {
        const ctx = contextService.loadContextFile();
        const updateCurrent = contextService.updateCurrent(ctx, key);
        contextService.save(updateCurrent);
        const response = { key: updateCurrent.current, path: updateCurrent.store[updateCurrent.current] };
        return { response };
      } catch (error) {
        return { error };
      }
    },
    deleteContext: (key: string): Result => {
      try {
        const ctx = contextService.loadContextFile();
        if (Object.keys(ctx.store).length === 1) {
          contextService.deleteContextFile();
          return { response: messages.CONTEXT_DELETED };
        }
        const updatedContext = contextService.deleteContext(ctx, key);
        contextService.save(updatedContext);
        const response = messages.CONTEXT_DELETED;
        return { response };
      } catch (error) {
        return { error };
      }
    },
    loadSpecFile: (): Result => {
      try {
        let response: SpecificationFile;
        const autoDetectedSpecFile = contextService.autoDetectSpecFile();
        if (autoDetectedSpecFile) {
          response = new SpecificationFile(autoDetectedSpecFile);
          return { response };
        }
        const context = contextService.loadContextFile();
        const currentCtx = context.store[context.current];
        if (!currentCtx) {
          throw new MissingCurrentContextError();
        }
        response = new SpecificationFile(currentCtx);
        return { response };
      } catch (error) {
        return { error };
      }
    },
    getContext: (key: string): Result => {
      try {
        const ctx = contextService.loadContextFile();
        const ctxValue = ctx.store[String(key)];
        if (!ctxValue) { throw new ContextNotFoundError(key); }
        const response = new SpecificationFile(ctxValue);
        return { response };
      } catch (error) {
        return { error };
      }
    }
  };
};

export interface useSpecFileInput {
  file?: string,
  context?: string
}

export interface useSpecFileOutput {
  specFile?: SpecificationFile,
  error?: Error
}

export const useSpecfile = (flags: useSpecFileInput): useSpecFileOutput => {
  const contextService: ContextService = container.resolve(ContextService);

  try {
    if (flags.file) {
      const specFile: SpecificationFile = new SpecificationFile(flags.file);
      if (specFile.isNotValid()) { throw new Error('Invalid spec path'); }
      return { specFile };
    }

    const ctx: Context = contextService.loadContextFile();

    if (flags.context) {
      const ctxFile = ctx.store[flags.context];
      if (!ctxFile) { throw new ContextNotFoundError(flags.context); }
      const specFile = new SpecificationFile(ctxFile);
      return { specFile };
    }

    if (ctx.current) {
      const currentFile = ctx.store[ctx.current];
      if (!currentFile) { throw new MissingCurrentContextError(); }
      const specFile = new SpecificationFile(currentFile);
      return { specFile };
    }

    const autoDetectedSpecPath = contextService.autoDetectSpecFile();

    if (typeof autoDetectedSpecPath === 'undefined') { throw new Error('No spec path found in your working directory, please use flags or store a context'); }

    const specFile = new SpecificationFile(autoDetectedSpecPath);

    return { specFile };
  } catch (error) {
    return { error };
  }
};
