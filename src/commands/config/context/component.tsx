/* eslint-disable sonarjs/no-duplicate-string */
import { ReactElement } from 'react';
import { ContextService } from '../../../config/context';
import { injectable } from 'tsyringe';
import { ContextMessageWriter, Messages } from './messages';

@injectable()
export class ContextComponent {
  constructor(
    private contextService: ContextService,
    private messageWriter: ContextMessageWriter,
    private messages: Messages
  ) {
  }

  list = (): ReactElement => {
    const ctx = this.contextService.context;
    if (!ctx) {
      return this.messageWriter.throwError(
        this.messages.notContextSaved()
      );
    }
    return this.messageWriter.list(ctx);
  }

  current = (): ReactElement => {
    const ctx = this.contextService.context;
    if (!ctx) {
      return this.messageWriter.throwError(
        this.messages.notContextSaved()
      );
    }
    if (!ctx.current) {
      return this.messageWriter.throwError(
        this.messages.missingCurrentContext()
      );
    }
    return this.messageWriter.current(ctx);
  }

  add = (contextName?: string, specPath?: string): ReactElement => {
    if (!contextName) {
      return this.messageWriter.throwError('context-name missing!');
    }
    if (!specPath) {
      return this.messageWriter.throwError('spec-path is missing!');
    }
    const ctx = this.contextService.addContext(contextName, specPath);
    if (!ctx) {
      return this.messageWriter.throwError('Something went wrong');
    }
    return this.messageWriter.add(
      this.messages.contextAdded(contextName)
    );
  }

  use = (contextName?: string): ReactElement => {
    if (!contextName) {
      return this.messageWriter.throwError('Missing context-name');
    }

    if (!this.contextService.context) {
      return this.messageWriter.throwError(
        this.messages.notContextSaved()
      );
    } 

    if (!this.contextService.context.getContext(contextName)) {
      return this.messageWriter.throwError(
        this.messages.contextNotFound(contextName)
      );
    }

    const ctx = this.contextService.updateCurrent(contextName);

    if (!ctx) {return this.messageWriter.throwError('Something went wrong');}

    return this.messageWriter.use(ctx);
  }

  remove = (contextName?: string): ReactElement => {
    if (!contextName) {
      return this.messageWriter.throwError('Missing context-name');
    }

    if (!this.contextService.context?.getContext(contextName)) {
      return this.messageWriter.throwError(
        this.messages.contextNotFound(contextName)
      );
    }

    const ctx = this.contextService.deleteContext(contextName);

    if (!ctx) {
      return this.messageWriter.throwError('Something went wrong');
    }

    return this.messageWriter.remove(
      this.messages.removeContext()
    );
  }
}
