import { Request, Response, Router } from 'express';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { Controller } from '@/interfaces';

/**
 * Controller which exposes the Parser functionality, to parse the AsyncAPI document.
 */
export class ParseController implements Controller {
  public basepath = '/parse';

  private async parse(req: Request, res: Response) {
    const stringified = JSON.stringify(req.asyncapi?.parsedDocument);
    res.status(200).json({
      parsed: stringified,
    });
  }

  public async boot(): Promise<Router> {
    const router = Router();

    router.post(
      `${this.basepath}`,
      await validationMiddleware({
        path: this.basepath,
        method: 'post',
        documents: ['asyncapi'],
      }),
      this.parse.bind(this),
    );

    return router;
  }
}
