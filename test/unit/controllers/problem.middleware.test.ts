import { expect } from 'chai';
import { Request, Response, NextFunction } from 'express';
import sinon from 'sinon';
import { problemMiddleware } from '../../../src/apps/api/middlewares/problem.middleware';
import { ProblemException } from '../../../src/apps/api/exceptions/problem.exception';

describe('problemMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let jsonStub: sinon.SinonStub;
  let statusStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      method: 'POST',
      path: '/v1/validate',
    };
    jsonStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub });
    res = {
      headersSent: false,
      status: statusStub,
    } as any;
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should serialize ProblemException and set status', () => {
    const error = new ProblemException({
      type: 'invalid-request',
      title: 'Invalid Request',
      status: 400,
      detail: 'Missing required field',
    });

    problemMiddleware(error, req as Request, res as Response, next as NextFunction);

    expect(statusStub.calledOnce).to.be.true;
    expect(statusStub.firstCall.args[0]).to.equal(400);
    expect(jsonStub.calledOnce).to.be.true;
    const responseBody = jsonStub.firstCall.args[0];
    expect(responseBody).to.have.property('type');
    expect(responseBody).to.have.property('title', 'Invalid Request');
    expect(responseBody).to.have.property('status', 400);
  });

  it('should default to 500 when no status provided', () => {
    const error = new ProblemException({
      type: 'unknown-error',
      title: '',
      status: 0,
    });

    problemMiddleware(error, req as Request, res as Response, next as NextFunction);

    expect(statusStub.calledOnce).to.be.true;
    expect(statusStub.firstCall.args[0]).to.equal(500);
  });

  it('should call next when headers already sent', () => {
    (res as any).headersSent = true;
    const error = new ProblemException({
      type: 'test',
      title: 'Test',
      status: 400,
    });

    problemMiddleware(error, req as Request, res as Response, next as NextFunction);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args[0]).to.equal(error);
    expect(statusStub.called).to.be.false;
  });

  it('should include stack for 500+ errors', () => {
    const error = new ProblemException({
      type: 'internal-error',
      title: 'Internal Error',
      status: 500,
      detail: 'Something went wrong',
    });

    problemMiddleware(error, req as Request, res as Response, next as NextFunction);

    expect(statusStub.firstCall.args[0]).to.equal(500);
  });

  it('should set default title when empty', () => {
    const error = new ProblemException({
      type: 'server-error',
      title: '',
      status: 500,
    });

    problemMiddleware(error, req as Request, res as Response, next as NextFunction);

    const responseBody = jsonStub.firstCall.args[0];
    expect(responseBody.title).to.equal('Internal server error');
  });
});
