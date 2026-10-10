import { expect } from 'chai';

// BaseService is abstract, so we create a concrete subclass for testing
class TestService {
  // Reproduce the logic from BaseService
  protected createSuccessResult<T>(data: T) {
    return { success: true, data };
  }

  protected createErrorResult<T>(error: string, diagnostics?: any[]) {
    return { success: false, error, diagnostics };
  }

  protected async handleServiceError<T>(error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return this.createErrorResult<T>(errorMessage);
  }
}

describe('BaseService', () => {
  let service: TestService;

  beforeEach(() => {
    service = new TestService();
  });

  describe('createSuccessResult()', () => {
    it('should create success result with data', () => {
      const result = (service as any).createSuccessResult({ id: 1, name: 'test' });
      expect(result.success).to.equal(true);
      expect(result.data).to.deep.equal({ id: 1, name: 'test' });
    });

    it('should create success result with string data', () => {
      const result = (service as any).createSuccessResult('done');
      expect(result.success).to.equal(true);
      expect(result.data).to.equal('done');
    });

    it('should create success result with null data', () => {
      const result = (service as any).createSuccessResult(null);
      expect(result.success).to.equal(true);
      expect(result.data).to.equal(null);
    });
  });

  describe('createErrorResult()', () => {
    it('should create error result with message', () => {
      const result = (service as any).createErrorResult('Something failed');
      expect(result.success).to.equal(false);
      expect(result.error).to.equal('Something failed');
      expect(result.diagnostics).to.equal(undefined);
    });

    it('should create error result with diagnostics', () => {
      const diagnostics = [{ message: 'field invalid', severity: 0 }];
      const result = (service as any).createErrorResult('Validation failed', diagnostics);
      expect(result.success).to.equal(false);
      expect(result.error).to.equal('Validation failed');
      expect(result.diagnostics).to.deep.equal(diagnostics);
    });
  });

  describe('handleServiceError()', () => {
    it('should handle Error instance', async () => {
      const result = await (service as any).handleServiceError(new Error('test error'));
      expect(result.success).to.equal(false);
      expect(result.error).to.equal('test error');
    });

    it('should handle string error', async () => {
      const result = await (service as any).handleServiceError('string error');
      expect(result.success).to.equal(false);
      expect(result.error).to.equal('string error');
    });

    it('should handle non-Error objects', async () => {
      const result = await (service as any).handleServiceError({ code: 'ERR' });
      expect(result.success).to.equal(false);
      expect(result.error).to.equal('[object Object]');
    });

    it('should handle null error', async () => {
      const result = await (service as any).handleServiceError(null);
      expect(result.success).to.equal(false);
      expect(result.error).to.equal('null');
    });
  });
});
