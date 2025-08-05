import { Router } from 'express';
import redoc from 'redoc-express';

import { Controller } from '@/interfaces';

import { API_VERSION } from '../constants';

export class DocsController implements Controller {
  public basepath = '/docs';

  public boot(): Router {
    const router = Router();

    router.get(`${this.basepath}/openapi.yaml`, (_, res) => {
      res.sendFile('openapi.yaml', { root: '.' });
    });

    router.get(
      this.basepath,
      redoc({
        title: 'OpenAPI Documentation',
        specUrl: `/${API_VERSION}${this.basepath}/openapi.yaml`,
      }),
    );

    return router;
  }
}
