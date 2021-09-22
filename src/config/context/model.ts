import { injectable } from 'tsyringe';
import fs from 'fs';
import { CONTEXTFILE_PATH } from '../../constants';

export interface IContext {
  readonly current?: string,
  readonly store: {
    [name: string]: string
  }
}

export class Context implements IContext {
  current?: string | undefined;
  store: { [name: string]: string; };

  constructor(ctx: IContext) {
    this.current = ctx.current;
    this.store = ctx.store;
  }

  getContext(contextName: string) {
    return this.store[contextName as string];
  }
}

export interface IContextAllocator {
  contextFilePath?: string
  load: () => Context | undefined
  save: (context: Context) => Context | undefined
}

@injectable()
export class ContextAllocator implements IContextAllocator {
  contextFilePath = CONTEXTFILE_PATH;
  load(): Context | undefined {
    try {
      return new Context(JSON.parse(fs.readFileSync(this.contextFilePath, 'utf8')) as IContext);
    } catch (error) {
      console.warn(error);// eslint-disable-line no-undef, no-console
      return undefined;
    }
  }

  save(context: Context) {
    try {
      fs.writeFileSync(this.contextFilePath, JSON.stringify({
        current: context.current,
        store: context.store
      }), { encoding: 'utf8' });
      return context;
    } catch (error) {
      console.warn(error);// eslint-disable-line no-undef, no-console
      return undefined;
    }
  }
}

