import React from 'react';
import { ContextComponent } from './component';
import { Context, ContextService, IContext, IContextAllocator } from '../../../config/context';
import { render } from 'ink-testing-library';
import { ContextMessageWriter, Messages } from './messages';
import chalk from 'chalk';

const ctx: IContext = {
  current: 'test',
  store: {
    test: './test/specification.yml',
    check: './test/specification.yml'
  }
};

class MockContextAllocator implements IContextAllocator {
  contextFilePath?: string | undefined;
  load = (): Context | undefined => {
    return new Context(ctx);
  }

  save = (context: IContext): Context | undefined => {
    return new Context(context);
  }
}

class UndefinedContextAllocator implements IContextAllocator {
  load() {
    return undefined;
  }

  save(context: IContext) {
    return new Context(context);
  }
}

const mockContextService = new ContextService(new MockContextAllocator());

let mockContextComponent = new ContextComponent(mockContextService, new ContextMessageWriter(), new Messages());

let undefinedContextService;

let messageWriter: ContextMessageWriter;

describe('ContextComponent Should ', () => {
  beforeEach(() => {
    messageWriter = new ContextMessageWriter();
  });
  test('be defined', () => {
    expect(mockContextComponent).toBeDefined();
  });

  test('list contexts', () => {
    const { lastFrame } = render(<mockContextComponent.list />);
    const testMessage = render(messageWriter.list(new Context(ctx)));
    expect(lastFrame()).toMatch(testMessage.lastFrame() as string);
  });

  test('show current context', () => {
    const actualMessage = render(<mockContextComponent.current />);
    const testMessage = render(messageWriter.current(new Context(ctx)));
    expect(actualMessage.lastFrame()).toMatch(testMessage.lastFrame() as string);
  });

  test('add new context', () => {
    const actualMessage = render(<mockContextComponent.add contextName={'test'} specPath={'./test/specification.yml'} />);
    const messages = new Messages();
    const testMessage = render(messageWriter.add(messages.contextAdded('test')));
    expect(actualMessage.lastFrame()).toMatch(testMessage.lastFrame() as string);
  });

  test('update current context', () => {
    const actualMessage = render(<mockContextComponent.use contextName='check' />);
    const testMessage = render(messageWriter.use(new Context({store: {check: './test/specification.yml'}, current: 'check'})));
    expect(actualMessage.lastFrame()).toMatch(testMessage.lastFrame() as string);
  });

  test('remove a context', () => {
    const actualMessage = render(<mockContextComponent.remove contextName="check" />);
    const testMessage = render(messageWriter.remove(new Messages().removeContext()));
    expect(actualMessage.lastFrame()).toMatch(testMessage.lastFrame() as string);
  });
});

describe('ContextComponent should', () => {
  beforeEach(() => {
    undefinedContextService = new ContextService(new UndefinedContextAllocator());
    mockContextComponent = new ContextComponent(undefinedContextService, new ContextMessageWriter(), new Messages());
  });

  test('should throw err', () => {
    const actualMessage = render(mockContextComponent.list());
    const errors = new Messages();
    expect(actualMessage.lastFrame()).toMatch(chalk.red(errors.notContextSaved()));
  });
});
