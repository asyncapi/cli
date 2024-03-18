import { Router, Request, Response, NextFunction } from 'express';
import { Controller } from '../core/interfaces';
import { ArchiverService } from '../../../core/services/archiver.service';
import { GeneratorService } from '../../../core/services/generator.service';
import { ProblemException } from '../core/exceptions/problem.exception';
// import { ProblemException } from '../exceptions/problem.exception';

export class GeneratorController implements Controller {
  public basepath = '/generate';

  private archiverService = new ArchiverService();
  private generatorService = new GeneratorService();

  private async generate(req: Request, res: Response, next: NextFunction) {
    console.log('Start archiverService.createZip');
    const zip = this.archiverService.createZip(res);

    let tmpDir: string | undefined;
    try {
      console.log('Creating temp dire');
      tmpDir = await this.archiverService.createTempDirectory();
      console.log(`tmpDir: ${tmpDir}`);
      const { asyncapi, template, parameters } = req.body;
      const generatorParameters = {
        forceWrite: true,
        templateParams: parameters
      };

      try {
        console.log(`Generating:  ${asyncapi} with template: ${template} parameters: ${parameters}, tmpDir: ${tmpDir}, parserConfig: ${JSON.stringify(this.prepareParserConfig(req))}`);
        await this.generatorService.generate(
          asyncapi,
          template,
          tmpDir,
          generatorParameters,
          this.prepareParserConfig(req)
        );
        console.log(`Generated:  ${asyncapi} with template: ${template} parameters: ${parameters}, tmpDir: ${tmpDir}, parserConfig: ${JSON.stringify(this.prepareParserConfig(req))}`);
      } catch (genErr: unknown) {
        console.log(genErr);
        return next(
          new ProblemException({
            type: 'internal-generator-error',
            title: 'Internal Generator error',
            status: 500,
            detail: (genErr as Error).message,
          })
        );
      }

      console.log('Start appending files');
      this.archiverService.appendDirectory(zip, tmpDir, 'template');
      this.archiverService.appendAsyncAPIDocument(zip, asyncapi);
      console.log('Finish appending files');

      res.status(200);
      return await this.archiverService.finalize(zip);
    } catch (err: unknown) {
      return next(
        new ProblemException({
          type: 'internal-server-error',
          title: 'Internal server error',
          status: 500,
          detail: (err as Error).message,
        })
      );
    } finally {
      if (tmpDir) {
        this.archiverService.removeTempDirectory(tmpDir);
      }
    }
  }

  private prepareParserConfig(req?: Request) {
    if (!req) {
      return {
        resolve: {
          file: false,
        },
      };
    }

    return {
      resolve: {
        file: false,
        http: {
          headers: {
            Cookie: req.header('Cookie'),
          },
          withCredentials: true,
        },
      },
      path:
        req.header('x-asyncapi-base-url') ||
        req.header('referer') ||
        req.header('origin'),
    };
  }

  private hello(req: Request, res: Response) {
    res.status(200).send('ok');
    return true;
  }
  public async boot(): Promise<Router> {
    const router: Router = Router();

    router.post(`${this.basepath}`, async (req: Request, res: Response, next: NextFunction) => {
      next();
    }, this.generate.bind(this));

    return router;
  }
}
