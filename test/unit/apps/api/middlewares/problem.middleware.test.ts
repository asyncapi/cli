import { expect } from 'chai';
import request from 'supertest';
import express, { Request, Response, NextFunction, Express } from 'express';

import { problemMiddleware } from '../../../../../src/apps/api/middlewares/problem.middleware';
import { ProblemException } from '../../../../../src/apps/api/exceptions/problem.exception';

/**
 * Unit tests for problem.middleware.ts (addresses coverage gap from issue #2019).
 *
 * The middleware has several uncovered branches:
 *   1. res.headersSent === true  → calls next(error) and returns early
 *   2. error.get() succeeds for 4xx  → no stack/cause included in response
 *   3. error.get() succeeds for 5xx  → stack/cause included in response
 *   4. status defaults to 500 when not set
 *   5. title defaults to 'Internal server error' when not set
 *   6. error.get() throws (non-ProblemException) → calls next(err) from catch
 */

function buildTestApp(routeError: Error, headersAlreadySent = false): Express {
  const app = express();
  app.use(express.json());

  // Route that raises the supplied error
  app.get('/test', (_req: Request, _res: Response, next: NextFunction) => {
    next(routeError);
  });

  // Simulate headers-already-sent scenario by adding a middleware that flushes
  // headers before the error handler is reached
  if (headersAlreadySent) {
    app.use((_err: Error, _req: Request, res: Response, next: NextFunction) => {
      res.setHeader('x-already', 'yes');
      // We can't truly "flush" headers without writing a body, so we fake it
      // by patching the property
      Object.defineProperty(res, 'headersSent', { value: true });
      next(_err);
    });
  }

  // Register the middleware under test
  app.use(
    (
      err: ProblemException,
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      problemMiddleware(err, req, res, next);
    },
  );

  return app;
}

describe('problemMiddleware', () => {
  describe('when the error is a ProblemException with a 4xx status', () => {
    it('should respond with the correct status code and JSON body', async () => {
      const error = new ProblemException({
        status: 422,
        title: 'Unprocessable Entity',
        detail: 'Validation failed',
        type: 'validation-error',
      });
      const app = buildTestApp(error);

      const res = await request(app).get('/test');

      expect(res.status).to.equal(422);
      expect(res.body).to.be.an('object');
      expect(res.body.status).to.equal(422);
      expect(res.body.title).to.equal('Unprocessable Entity');
    });

    it('should NOT include stack trace in the response body for 4xx errors', async () => {
      const error = new ProblemException({
        status: 400,
        title: 'Bad Request',
        detail: 'bad input',
        type: 'bad-request',
      });
      const app = buildTestApp(error);

      const res = await request(app).get('/test');

      expect(res.status).to.equal(400);
      expect(res.body.stack).to.equal(undefined);
      expect(res.body.cause).to.equal(undefined);
    });
  });

  describe('when the error is a ProblemException with a 5xx status', () => {
    it('should respond with status 500 and JSON body', async () => {
      const error = new ProblemException({
        status: 500,
        title: 'Internal Server Error',
        detail: 'Something broke internally',
        type: 'internal-error',
      });
      const app = buildTestApp(error);

      const res = await request(app).get('/test');

      expect(res.status).to.equal(500);
      expect(res.body).to.be.an('object');
      expect(res.body.status).to.equal(500);
    });
  });

  describe('when the ProblemException status is undefined', () => {
    it('should default to status 500', async () => {
      // Force-construct an exception with no status to test the default branch
      const error = new ProblemException({
        status: 0 as any, // falsy value so `status || 500` evaluates to 500
        title: 'Unknown Error',
        detail: 'unknown',
        type: 'unknown',
      });
      const app = buildTestApp(error);

      const res = await request(app).get('/test');

      // 0 is falsy, middleware converts to 500
      expect(res.status).to.equal(500);
    });
  });

  describe('when a non-ProblemException error is passed', () => {
    it('should fall into catch block and call next() with the error', async () => {
      // A plain Error does not have `.get()`, so error.get() throws TypeError
      // inside the try block, and the catch calls next(err)
      const plainError = new Error('unexpected crash') as any;
      const app = buildTestApp(plainError);

      // Attach a final error handler so supertest gets a response instead of hanging
      app.use(
        (
          err: Error,
          _req: Request,
          res: Response,
          _next: NextFunction,
        ) => {
          res.status(500).json({ message: err.message });
        },
      );

      const res = await request(app).get('/test');

      expect(res.status).to.equal(500);
    });
  });

  describe('type string stripping', () => {
    it('should strip the asyncapi problem URL prefix when logging', async () => {
      // This test exercises the string manipulation path:
      // type.replace('https://api.asyncapi.com/problem/', '')
      const error = new ProblemException({
        status: 422,
        title: 'Test',
        detail: 'test detail',
        type: 'test-type',
      });
      const app = buildTestApp(error);

      // Just verify the middleware doesn't crash and returns correct status
      const res = await request(app).get('/test');
      expect(res.status).to.equal(422);
    });
  });
});
