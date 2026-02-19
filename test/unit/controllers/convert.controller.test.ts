import request from 'supertest';

import './setup.test';
import { App } from '../../../src/apps/api/app';
import { ProblemException } from '../../../src/apps/api/exceptions/problem.exception';
import { ConvertController } from '../../../src/apps/api/controllers/convert.controller';

describe('ConvertController', () => {
  describe('[POST] /convert', () => {
    it('should convert a valid AsyncAPI document', async () => {
      const app = new App([new ConvertController()]);
      await app.init();

      await request(app.getServer())
        .post('/v1/convert')
        .send({
          source: {
            asyncapi: '2.3.0',
            info: {
              title: 'Test API',
              version: '1.0.0'
            },
            channels: {
              'my-channel': {
                publish: {
                  message: {
                    payload: {
                      type: 'object'
                    }
                  }
                }
              }
            }
          },
          format: 'asyncapi',
          'target-version': '3.1.0',
          perspective: 'server'
        })
        .expect(200)
        .expect(res => {
          if (!res.body.converted) {
            throw new Error('Expected converted document in response');
          }
          if (res.body.sourceFormat !== 'asyncapi') {
            throw new Error(`Expected sourceFormat to be asyncapi but got ${res.body.sourceFormat}`);
          }
        });
    });

    it('should return 422 when conversion fails', async () => {
      const app = new App([new ConvertController()]);
      await app.init();

      await request(app.getServer())
        .post('/v1/convert')
        .send({
          source: '{ "asyncapi": "2.0.0", "info": {} }', // deliberately malformed for conversion service
          format: 'asyncapi'
        })
        .expect(422)
        .expect(res => {
          if (res.body.type !== ProblemException.createType('invalid-asyncapi-document')) {
            throw new Error(`Expected error type conversion-error but got ${res.body.type}`);
          }
          if (!res.body.detail) {
            throw new Error('Expected error detail in response');
          }
        });
    });

    it('should return 422 for invalid request body', async () => {
      const app = new App([new ConvertController()]);
      await app.init();

      await request(app.getServer())
        .post('/v1/convert')
        .send({
          format: 'asyncapi'
          // missing `source`
        })
        .expect(422)
        .expect(res => {
          if (res.body.type !== ProblemException.createType('invalid-request-body')) {
            throw new Error('Expected validation error for missing source');
          }
        });
    });
  });
});
