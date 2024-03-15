import { Router, Request, Response, NextFunction } from 'express';
import { Controller } from '../core/interfaces';
// import { ProblemException } from '../exceptions/problem.exception';

export class PingController implements Controller {
  public basepath = '/ping';

  public async boot(): Promise<Router> {
    const router: Router = Router();

    router.get(`${this.basepath}`, async (req: Request, res: Response, next: NextFunction) => {
      try {
        return res.status(200).send('pong');
      } catch (err) {
        return next(err);
      }
    });

    return router;
  }
}
