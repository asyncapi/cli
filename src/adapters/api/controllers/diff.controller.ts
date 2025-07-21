import { NextFunction, Request, Response, Router } from 'express';
import { diff } from '@asyncapi/diff';

import { validationMiddleware } from '../middlewares/validation.middleware';

import { ProblemException } from '../exceptions/problem.exception';
import { Controller } from '@/interfaces';

export class DiffController implements Controller {
  public basepath = '/diff';

  private async diff(req: Request, res: Response, next: NextFunction) {
    const { asyncapis } = req.body;

    try {
      const output = diff(asyncapis[0], asyncapis[1]).getOutput();
      res.status(200).json({ diff: output });
    } catch (err) {
      return next(
        new ProblemException({
          type: 'internal-diff-error',
          title: 'Internal Diff error',
          status: 500,
          detail: (err as Error).message,
        })
      );
    }
  }

  public async boot(): Promise<Router> {
    const router = Router();

    router.post(
      this.basepath,
      await validationMiddleware({
        path: this.basepath,
        method: 'post',
        documents: ['asyncapis'],
      }),
      this.diff.bind(this)
    );

    return router;
  }
}
