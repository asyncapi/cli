import { Context, IContextAllocator } from './model';
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
    return false;
  }

  deleteContext(contextName: string) {
    if (this._context && this._context.store[contextName as string]) {
      delete this._context.store[contextName as string];
      return this.contextAllocator.save(this._context);
    }
    return false;
  }

  updateCurrent(contextName: string) {
    if (this._context && this._context.getContext(contextName)) {
      this._context.current = contextName;
      if (this.contextAllocator.save) {
        this.contextAllocator.save(this._context);
      }
      return this.contextAllocator.save(this._context);
    }
    return false;
  }

  static instantiate() {
    return container.resolve(ContextService);
  }
}
