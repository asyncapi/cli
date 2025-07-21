import { NextFunction, Request, Response } from 'express';

import { ProblemException } from '../exceptions/problem.exception';
import { logger } from '@utils/logger';

/**
 * Catch problem exception, log it and serialize error to human readable form.
 */
export function problemMiddleware(error: ProblemException, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(error);
  }

  try {
    const problemShape = error.get();
    const status = problemShape.status = problemShape.status || 500;
    problemShape.title = problemShape.title || 'Internal server error';

    logger.error(`[${req.method}] ${req.path} >> Status:: ${status}, Type:: ${problemShape.type.replace('https://api.asyncapi.com/problem/', '')}, Title:: ${problemShape.title}, Detail:: ${problemShape.detail}`);

    const isError = status >= 500;
    const problem = error.toObject({ includeStack: isError, includeCause: isError });
    res.status(status).json(problem);
  } catch (err: unknown) {
    next(err);
  }
}
