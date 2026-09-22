import { expect } from 'chai';
import * as os from 'os';

import { isContextFileEmpty } from '../../../src/domains/models/Context';
import {
  ContextNotFoundError,
  MissingCurrentContextError,
  ContextAlreadyExistsError,
  ContextFileEmptyError,
} from '../../../src/errors/context-error';

describe('Context', () => {
  describe('isContextFileEmpty', () => {
    it('should return true for empty store object', async () => {
      const result = await isContextFileEmpty({ store: {} });
      expect(result).to.be.true;
    });

    it('should return false when store has entries', async () => {
      const result = await isContextFileEmpty({ store: { home: '/path/to/file' } });
      expect(result).to.be.false;
    });

    it('should return false when current is set even with empty store', async () => {
      const result = await isContextFileEmpty({ store: {}, current: 'home' } as any);
      expect(result).to.be.false;
    });

    it('should return false for non-empty store with multiple entries', async () => {
      const result = await isContextFileEmpty({
        store: { home: '/path', work: '/work' },
      });
      expect(result).to.be.false;
    });
  });

  describe('Error classes', () => {
    it('ContextNotFoundError should contain context name in message', () => {
      const err = new ContextNotFoundError('my-context');
      expect(err.message).to.contain('my-context');
    });

    it('MissingCurrentContextError should have descriptive message', () => {
      const err = new MissingCurrentContextError();
      expect(err.message).to.be.a('string');
      expect(err.message.length).to.be.greaterThan(0);
    });

    it('ContextAlreadyExistsError should contain context name', () => {
      const err = new ContextAlreadyExistsError('dup-context', '/path/to/file');
      expect(err.message).to.contain('dup-context');
    });

    it('ContextFileEmptyError should contain file path', () => {
      const err = new ContextFileEmptyError('/path/to/.asyncapi-cli');
      expect(err.message).to.contain('.asyncapi-cli');
    });
  });
});
