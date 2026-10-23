import { expect } from 'chai';
import type { Request, Response, NextFunction } from 'express';
import { problemMiddleware } from '../../../src/apps/api/middlewares/problem.middleware';
import { ProblemException } from '../../../src/apps/api/exceptions/problem.exception';

describe('problemMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let nextCalledWith: any;

  beforeEach(() => {
    nextCalledWith = null;
    mockReq = { method: 'POST', path: '/api/v1/validate' };
    mockRes = { headersSent: false };
    mockNext = (err?: any) => { nextCalledWith = err; };
  });

  it('should call next if headers have already been sent', () => {
    (mockRes as any).headersSent = true;
    const error = new ProblemException({ type: 'test-error', status: 500, title: 'Test Error' });
    problemMiddleware(error, mockReq as Request, mockRes as Response, mockNext);
    expect(nextCalledWith).to.equal(error);
  });

  it('should respond with error status and JSON body for ProblemException', () => {
    const error = new ProblemException({ type: 'invalid-request-body', status: 422, title: 'Invalid Request Body', detail: 'The request body is invalid' });
    let statusCode = 0;
    let jsonBody: any = null;
    (mockRes as any).status = (code: number) => { statusCode = code; return mockRes as Response; };
    (mockRes as any).json = (body: any) => { jsonBody = body; return mockRes as Response; };
    problemMiddleware(error, mockReq as Request, mockRes as Response, mockNext);
    expect(statusCode).to.equal(422);
    expect(jsonBody).to.be.an('object');
    expect(jsonBody.title).to.equal('Invalid Request Body');
    expect(nextCalledWith).to.be.null;
  });

  it('should default to status 500 when no status is provided', () => {
    const error = new ProblemException({ type: 'internal-error', title: 'Internal Error' } as any);
    let statusCode = 0;
    (mockRes as any).status = (code: number) => { statusCode = code; return mockRes as Response; };
    (mockRes as any).json = () => mockRes as Response;
    problemMiddleware(error, mockReq as Request, mockRes as Response, mockNext);
    expect(statusCode).to.equal(500);
  });

  it('should default to "Internal server error" when no title is provided', () => {
    const error = new ProblemException({ type: 'server-error', status: 500 } as any);
    let jsonBody: any = null;
    (mockRes as any).status = () => mockRes as Response;
    (mockRes as any).json = (body: any) => { jsonBody = body; return mockRes as Response; };
    problemMiddleware(error, mockReq as Request, mockRes as Response, mockNext);
    expect(jsonBody.title).to.equal('Internal server error');
  });

  it('should call next when an unexpected error occurs during serialization', () => {
    const error = new ProblemException({ type: 'serialization-error', status: 422, title: 'Test' });
    (error as any).get = () => { throw new Error('unexpected serialization error'); };
    problemMiddleware(error, mockReq as Request, mockRes as Response, mockNext);
    expect(nextCalledWith).to.be.an.instanceOf(Error);
  });
});
