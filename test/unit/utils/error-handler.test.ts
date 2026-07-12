import { expect } from 'chai';
import {
  getErrorMessage,
  getErrorStack,
  isError,
  hasErrorCode,
  withErrorHandling,
  success,
  failure,
  failureFromError,
} from '../../../src/utils/error-handler';

describe('error-handler utilities', () => {
  describe('getErrorMessage()', () => {
    it('should extract message from Error instance', () => {
      const err = new Error('something went wrong');
      expect(getErrorMessage(err)).to.equal('something went wrong');
    });

    it('should return string errors directly', () => {
      expect(getErrorMessage('raw string error')).to.equal('raw string error');
    });

    it('should extract message from object with message property', () => {
      const err = { message: 'object error' };
      expect(getErrorMessage(err)).to.equal('object error');
    });

    it('should return fallback for null', () => {
      expect(getErrorMessage(null)).to.equal('An unknown error occurred');
    });

    it('should return fallback for undefined', () => {
      expect(getErrorMessage(undefined)).to.equal('An unknown error occurred');
    });

    it('should return fallback for number', () => {
      expect(getErrorMessage(42)).to.equal('An unknown error occurred');
    });

    it('should return custom fallback message', () => {
      expect(getErrorMessage(undefined, 'Custom fallback')).to.equal('Custom fallback');
    });

    it('should handle object with non-string message property', () => {
      const err = { message: 123 };
      expect(getErrorMessage(err)).to.equal('123');
    });
  });

  describe('getErrorStack()', () => {
    it('should return stack from Error instance', () => {
      const err = new Error('test');
      const stack = getErrorStack(err);
      expect(stack).to.be.a('string');
      expect(stack).to.include('Error: test');
    });

    it('should return undefined for non-Error values', () => {
      expect(getErrorStack('string')).to.equal(undefined);
      expect(getErrorStack(null)).to.equal(undefined);
      expect(getErrorStack(42)).to.equal(undefined);
      expect(getErrorStack({ stack: 'fake stack' })).to.equal(undefined);
    });
  });

  describe('isError()', () => {
    it('should return true for Error instances', () => {
      expect(isError(new Error('test'))).to.equal(true);
      expect(isError(new TypeError('test'))).to.equal(true);
      expect(isError(new RangeError('test'))).to.equal(true);
    });

    it('should return false for non-Error values', () => {
      expect(isError('string')).to.equal(false);
      expect(isError(null)).to.equal(false);
      expect(isError(undefined)).to.equal(false);
      expect(isError({})).to.equal(false);
      expect(isError({ message: 'fake' })).to.equal(false);
    });
  });

  describe('hasErrorCode()', () => {
    it('should return true when error has matching code', () => {
      const err = Object.assign(new Error('not found'), { code: 'ENOENT' });
      expect(hasErrorCode(err, 'ENOENT')).to.equal(true);
    });

    it('should return false when code does not match', () => {
      const err = Object.assign(new Error('denied'), { code: 'EACCES' });
      expect(hasErrorCode(err, 'ENOENT')).to.equal(false);
    });

    it('should return false for null', () => {
      expect(hasErrorCode(null, 'ENOENT')).to.equal(false);
    });

    it('should return false for non-objects', () => {
      expect(hasErrorCode('string', 'ENOENT')).to.equal(false);
      expect(hasErrorCode(42, 'ENOENT')).to.equal(false);
    });

    it('should return false for objects without code property', () => {
      expect(hasErrorCode({ message: 'test' }, 'ENOENT')).to.equal(false);
    });
  });

  describe('withErrorHandling()', () => {
    it('should return result on success', async () => {
      const fn = async (x: number) => x * 2;
      const handler = () => {};
      const wrapped = withErrorHandling(fn, handler);
      const result = await wrapped(5);
      expect(result).to.equal(10);
    });

    it('should call error handler and return undefined on failure', async () => {
      let capturedError: unknown;
      const fn = async () => { throw new Error('boom'); };
      const handler = (err: unknown) => { capturedError = err; };
      const wrapped = withErrorHandling(fn, handler);
      const result = await wrapped();
      expect(result).to.equal(undefined);
      expect(capturedError).to.be.instanceOf(Error);
      expect((capturedError as Error).message).to.equal('boom');
    });

    it('should pass arguments through to wrapped function', async () => {
      const fn = async (a: string, b: string) => `${a}-${b}`;
      const wrapped = withErrorHandling(fn, () => {});
      const result = await wrapped('hello', 'world');
      expect(result).to.equal('hello-world');
    });
  });

  describe('success()', () => {
    it('should create a success result', () => {
      const result = success({ id: 1 });
      expect(result.success).to.equal(true);
      expect(result.data).to.deep.equal({ id: 1 });
    });

    it('should work with primitive data', () => {
      const result = success('done');
      expect(result.success).to.equal(true);
      expect(result.data).to.equal('done');
    });
  });

  describe('failure()', () => {
    it('should create an error result', () => {
      const result = failure('something failed');
      expect(result.success).to.equal(false);
      expect(result.error).to.equal('something failed');
    });

    it('should include code when provided', () => {
      const result = failure('not found', 'ENOENT');
      expect(result.code).to.equal('ENOENT');
    });

    it('should include details when provided', () => {
      const result = failure('bad', 'ERR', { field: 'name' });
      expect(result.details).to.deep.equal({ field: 'name' });
    });

    it('should have undefined code and details when not provided', () => {
      const result = failure('error');
      expect(result.code).to.equal(undefined);
      expect(result.details).to.equal(undefined);
    });
  });

  describe('failureFromError()', () => {
    it('should extract message from Error', () => {
      const result = failureFromError(new Error('oops'));
      expect(result.success).to.equal(false);
      expect(result.error).to.equal('oops');
      expect(result.details).to.have.property('stack');
    });

    it('should use fallback for non-Error values', () => {
      const result = failureFromError(null, 'fallback msg');
      expect(result.error).to.equal('fallback msg');
      expect(result.details).to.equal(undefined);
    });

    it('should use default fallback message', () => {
      const result = failureFromError(42);
      expect(result.error).to.equal('An unknown error occurred');
    });
  });
});
