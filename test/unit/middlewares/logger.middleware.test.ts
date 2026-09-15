import { expect } from 'chai';
import { loggerMiddleware } from '../../../src/apps/api/middlewares/logger.middleware';

describe('loggerMiddleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: () => void;
  let nextCalled: boolean;

  beforeEach(() => {
    nextCalled = false;
    mockReq = { method: 'GET', originalUrl: '/api/v1/validate' };
    mockRes = {
      on: (event: string, handler: () => void) => {},
      removeListener: () => {},
      emit: (event: string) => {},
    };
    mockNext = () => { nextCalled = true; };
  });

  it('should call next() immediately', () => {
    loggerMiddleware(mockReq, mockRes, mockNext);
    expect(nextCalled).to.be.true;
  });

  it('should register finish event handler', () => {
    let finishHandler: (() => void) | null = null;
    mockRes.on = (event: string, handler: () => void) => {
      if (event === 'finish') { finishHandler = handler; }
    };
    loggerMiddleware(mockReq, mockRes, mockNext);
    expect(nextCalled).to.be.true;
    expect(finishHandler).to.be.a('function');
  });

  it('should handle POST requests', () => {
    mockReq.method = 'POST';
    mockReq.originalUrl = '/api/v1/generate';
    loggerMiddleware(mockReq, mockRes, mockNext);
    expect(nextCalled).to.be.true;
  });
});
