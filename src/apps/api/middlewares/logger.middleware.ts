import { NextFunction, Request, Response } from 'express';
import { logger } from '@utils/logger';

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      `[${req.method}] ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
    );
  });
  next();
}
