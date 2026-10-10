import request from 'supertest';
import { expect } from 'chai';

import './setup.test';
import { App } from '../../../src/apps/api/app';
import { DocsController } from '../../../src/apps/api/controllers/docs.controller';

describe('DocsController', () => {
  describe('[GET] /docs', () => {
    it('should return HTML documentation page', async () => {
      const app = new App([new DocsController()]);
      await app.init();

      const response = await request(app.getServer())
        .get('/v1/docs')
        .expect(200);

      expect(response.headers['content-type']).to.include('text/html');
      expect(response.text).to.include('redoc');
    });

    it('should serve OpenAPI spec at /docs/openapi.yaml', async () => {
      const app = new App([new DocsController()]);
      await app.init();

      const response = await request(app.getServer())
        .get('/v1/docs/openapi.yaml')
        .expect(200);

      // Should return YAML content
      expect(response.text).to.include('openapi');
    });
  });
});
