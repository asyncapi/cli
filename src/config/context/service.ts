import { Context, IContextAllocator, IContext } from './model';
import { injectable, inject, container } from 'tsyringe';

@injectable()
export class ContextService {
  private _context: Context | undefined
  constructor(
    @inject('IContextAllocator') private contextAllocator: IContextAllocator
  ) {
    this._context = this.contextAllocator.load();
  }

  get context() {
    return this._context;
  }

  addContext(contextName: string, filePath: string): boolean {
    if (this._context) {
      this._context.store[contextName as string] = filePath;
      return this.contextAllocator.save(this._context);
    }
    this._context = new Context(this.createNewContext(contextName, filePath));
    return this.contextAllocator.save(this._context);
  }

  deleteContext(contextName: string) {
    if (this._context && this._context.store[contextName as string]) {
      if (this._context.current === contextName) { delete this._context.current; }
      delete this._context.store[contextName as string];
      return this.contextAllocator.save(this._context);
    }
    return false;
  }

  updateCurrent(contextName: string) {
    if (this._context && this._context.getContext(contextName)) {
      this._context.current = contextName;
      return this.contextAllocator.save(this._context);
    }
    return false;
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
