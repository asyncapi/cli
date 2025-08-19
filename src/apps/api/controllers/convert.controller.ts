import { NextFunction, Request, Response, Router } from 'express';
import { Controller, AsyncAPIDocument, ConversionOptions } from '@/interfaces';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { ConversionService } from '@services/convert.service';
import { ProblemException } from '../exceptions/problem.exception';
import { Specification } from '@/domains/models/SpecificationFile';

interface ConvertDTO extends ConversionOptions {
  source: AsyncAPIDocument | string;
}

/**
 * Controller which exposes the Convert functionality
 */
export class ConvertController implements Controller {
  public basepath = '/convert';
  private conversionService = new ConversionService();

  private async convert(req: Request, res: Response, next: NextFunction) {
    try {
      const options = req.body as ConvertDTO;
      const specFile = new Specification(
        typeof options.source === 'string'
          ? options.source
          : JSON.stringify(options.source),
      );
      const result = await this.conversionService.convertDocument(
        specFile,
        options,
      );

      if (!result.success) {
        return next(
          new ProblemException({
            type: 'conversion-error',
            title: 'Conversion failed',
            status: 400,
            detail: result.error,
          }),
        );
      }

      res.status(200).json({
        converted: result.data?.convertedDocument,
        sourceFormat: result.data?.originalFormat,
      });
    } catch (err: unknown) {
      if (err instanceof ProblemException) {
        return next(err);
      }

      return next(
        new ProblemException({
          type: 'internal-server-error',
          title: 'Internal server error',
          status: 500,
          detail: (err as Error).message,
        }),
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
        documents: ['source'],
        condition: (req: Request) => {
          const body = req.body as ConvertDTO;
          return body.format === 'asyncapi';
        },
      }),
      this.convert.bind(this),
    );

    return router;
  }
}
