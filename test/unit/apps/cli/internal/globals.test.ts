import { expect } from 'chai';
import chokidar from 'chokidar';
import sinon from 'sinon';
import Command from '../../../../../src/apps/cli/internal/base';
import {
  emitWatchStarted,
  isWatchRerun,
  specWatcher,
} from '../../../../../src/apps/cli/internal/globals';
import { Specification } from '../../../../../src/domains/models/SpecificationFile';
import type { StructuredOutput } from '../../../../../src/apps/cli/internal/output/types';

describe('structured watch events', () => {
  afterEach(() => {
    sinon.restore();
    process.exitCode = undefined;
  });

  it('emits the compact watch.started result', () => {
    const emitted: StructuredOutput[] = [];
    const handler = {
      emitStructuredOutput: (output: StructuredOutput) => emitted.push(output),
      jsonEnabled: () => true,
    } as unknown as Command;
    const result: StructuredOutput = {
      status: 'success',
      message: 'Validated.',
      data: { valid: true },
      errors: [],
    };

    emitWatchStarted(handler, result, ['/tmp/asyncapi.yaml']);

    expect(emitted).to.deep.equal([{
      ...result,
      data: {
        valid: true,
        event: 'watch.started',
        watchedFiles: ['/tmp/asyncapi.yaml'],
      },
    }]);
  });

  it('emits file and command envelopes once while a JSON rerun is active', async () => {
    let onChange: (() => Promise<void>) | undefined;
    sinon.stub(chokidar, 'watch').returns({
      on: (_event: string, callback: () => Promise<void>) => {
        onChange = callback;
      },
    } as never);

    const emitted: StructuredOutput[] = [];
    let finishRun: (() => void) | undefined;
    let runs = 0;
    const result: StructuredOutput = {
      status: 'success',
      message: 'Validated.',
      data: { valid: true },
      errors: [],
    };
    const handler = {
      jsonEnabled: () => true,
      emitStructuredOutput: (output: StructuredOutput) => emitted.push(output),
      emitStructuredError: sinon.spy(),
      run: async () => {
        runs += 1;
        expect(isWatchRerun(handler)).to.equal(true);
        await new Promise<void>((resolve) => {
          finishRun = resolve;
        });
        return result;
      },
    } as unknown as Command;

    specWatcher({
      spec: new Specification('', { filepath: '/tmp/asyncapi.yaml' }),
      handler,
      handlerName: 'validate',
      label: `TEST_JSON_${Date.now()}`,
    });

    const firstChange = onChange?.();
    await onChange?.();
    expect(runs).to.equal(1);
    finishRun?.();
    await firstChange;

    expect(emitted).to.have.length(2);
    expect(emitted[0]).to.include({ status: 'success' });
    expect(emitted[0].data).to.deep.equal({ event: 'file.changed', path: '/tmp/asyncapi.yaml' });
    expect(emitted[1]).to.deep.equal({
      ...result,
      data: { valid: true, event: 'command.completed' },
    });
    expect(process.exitCode).to.equal(undefined);
  });

  it('emits rerun errors without invoking catch or changing the exit code', async () => {
    let onChange: (() => Promise<void>) | undefined;
    sinon.stub(chokidar, 'watch').returns({
      on: (_event: string, callback: () => Promise<void>) => {
        onChange = callback;
      },
    } as never);

    const error = new Error('invalid update');
    const emitStructuredError = sinon.spy();
    const catchError = sinon.spy(async () => {
      process.exitCode = 1;
    });
    const handler = {
      jsonEnabled: () => true,
      emitStructuredOutput: sinon.spy(),
      emitStructuredError,
      run: async () => {
        throw error;
      },
      catch: catchError,
    } as unknown as Command;

    specWatcher({
      spec: new Specification('', { filepath: '/tmp/invalid.yaml' }),
      handler,
      handlerName: 'validate',
      label: `TEST_ERROR_${Date.now()}`,
    });
    await onChange?.();

    expect(emitStructuredError.calledOnceWithExactly(error)).to.equal(true);
    expect(catchError.called).to.equal(false);
    expect(process.exitCode).to.equal(undefined);
  });
});
