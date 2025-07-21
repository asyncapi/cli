import { Request, Response, Router } from 'express';

import { validationMiddleware } from '../middlewares/validation.middleware';

import { Controller } from '@/interfaces';

/**
 * Controller which exposes the Parser functionality, to validate the AsyncAPI document.
 */
export class ValidateController implements Controller {
  public basepath = '/validate';

  private async validate(req: Request, res: Response) {
    if (req.asyncapi?.parsedDocuments?.length) {
      const results = req.asyncapi.validationResults?.map(result => ({
        status: result.status,
        asyncapi: result.document,
        diagnostics: result.diagnostics,
        score: result.score,
      })) || [];
      res.status(200).json({
        results,
      });
    } else {
      res.status(200).json({
        status: req.asyncapi?.validationResult?.status,
        asyncapi: req.asyncapi?.validationResult?.document,
        diagnostics: req.asyncapi?.validationResult?.diagnostics,
        score: req.asyncapi?.validationResult?.score,
      });
    }
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
      this.validate.bind(this)
    );

    return router;
  }
}
