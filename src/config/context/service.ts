import { Context, IContextAllocator, IContext, ContextAllocator } from './model';
import { injectable, inject, container } from 'tsyringe';

@injectable()
export class ContextService {
  private _context: Context | undefined
  constructor(
    @inject(ContextAllocator) private contextAllocator: IContextAllocator
  ) {
    this._context = this.contextAllocator.load();
  }

  get context() {
    return this._context;
  }

  addContext(contextName: string, filePath: string): Context | undefined {
    if (this._context) {
      this._context.store[contextName as string] = filePath;
      return this.contextAllocator.save(this._context);
    }
    this._context = new Context(this.createNewContext(contextName, filePath));
    return this.contextAllocator.save(this._context);
  }

  deleteContext(contextName: string): Context | undefined {
    if (this._context && this._context.store[contextName as string]) {
      if (this._context.current === contextName) { delete this._context.current; }
      delete this._context.store[contextName as string];
      return this.contextAllocator.save(this._context);
    }
    return undefined;
  }

  updateCurrent(contextName: string): Context | undefined {
    if (this._context && this._context.getContext(contextName)) {
      this._context.current = contextName;
      return this.contextAllocator.save(this._context);
    }
    return undefined;
  }

  static instantiate() {
    return container.resolve(ContextService);
  }

  private createNewContext(contextName: string, filePath: string): IContext {
    const ctx: IContext = { current: contextName, store: {} };
    ctx.store[contextName as string] = filePath;
    return ctx;
  }
}
