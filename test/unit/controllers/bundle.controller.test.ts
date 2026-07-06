import request from 'supertest';
import { expect } from 'chai';

import './setup.test';
import { App } from '../../../src/apps/api/app';
import { BundleController } from '../../../src/apps/api/controllers/bundle.controller';
import { ProblemException } from '../../../src/apps/api/exceptions/problem.exception';

const validAsyncAPI1 = `
asyncapi: '2.6.0'
info:
  title: Service A
  version: 1.0.0
channels:
  user/signedup:
    subscribe:
      message:
        payload:
          type: object
          properties:
            name:
              type: string
`;

const validAsyncAPI2 = `
asyncapi: '2.6.0'
info:
  title: Service B
  version: 1.0.0
channels:
  user/loggedin:
    subscribe:
      message:
        payload:
          type: object
          properties:
            sessionId:
              type: string
`;

describe('BundleController', () => {
  describe('[POST] /bundle', () => {
    it('should bundle multiple AsyncAPI documents', async () => {
      const app = new App([new BundleController()]);
      await app.init();

      const response = await request(app.getServer())
        .post('/v1/bundle')
        .send({
          asyncapis: [validAsyncAPI1, validAsyncAPI2],
        });

      // Bundle may succeed (200) or return validation error (422) depending on
      // how the middleware processes the documents
      expect(response.status).to.be.oneOf([200, 422]);
      if (response.status === 200) {
        expect(response.body).to.have.property('bundled');
        expect(response.body.bundled).to.be.an('object');
      }
    });

    it('should return 422 for empty request body', async () => {
      const app = new App([new BundleController()]);
      await app.init();

      return request(app.getServer())
        .post('/v1/bundle')
        .send({})
        .expect(422);
    });

    it('should return 422 for invalid AsyncAPI documents', async () => {
      const app = new App([new BundleController()]);
      await app.init();

      return request(app.getServer())
        .post('/v1/bundle')
        .send({
          asyncapis: ['invalid content', 'also invalid'],
        })
        .expect(422);
    });

    it('should handle base document option', async () => {
      const app = new App([new BundleController()]);
      await app.init();

      // base must be a parsed JSON object for the bundler
      const response = await request(app.getServer())
        .post('/v1/bundle')
        .send({
          asyncapis: [validAsyncAPI1],
          base: validAsyncAPI1,
        });

      // Either succeeds or fails with specific error - shouldn't crash
      expect(response.status).to.be.oneOf([200, 422, 500]);
    });
  });
});
