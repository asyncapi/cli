import request from 'supertest';

import './setup.test';
import { App } from '../../../src/apps/api/app';
import { ProblemException } from '../../../src/apps/api/exceptions/problem.exception';

import { ParseController } from '../../../src/apps/api/controllers/parse.controller';

const validJSONAsyncAPI = {
  asyncapi: '2.0.0',
  info: {
    title: 'My API',
    version: '1.0.0'
  },
  channels: {}
};
const invalidJSONAsyncAPI = {
  asyncapi: '2.0.0',
  info: {
    tite: 'My API', // spelled wrong on purpose to throw an error in the test
    version: '1.0.0'
  },
  channels: {}
};

describe('ParseController', () => {
  describe('[POST] /parse', () => {
    it('should return stringified AsyncAPI document', async () => {
      const app = new App([new ParseController()]);
      await app.init();

      return request(app.getServer())
        .post('/v1/parse')
        .send({
          asyncapi: validJSONAsyncAPI
        })
        .expect(200, {
          parsed: '{"asyncapi":"2.0.0","info":{"title":"My API","version":"1.0.0"},"channels":{},"x-parser-spec-parsed":true,"x-parser-api-version":3}',
        });
    });

    it('should throw error when sent an invalid AsyncAPI document', async () => {
      const app = new App([new ParseController()]);
      await app.init();

      return request(app.getServer())
        .post('/v1/parse')
        .send({
          asyncapi: invalidJSONAsyncAPI
        })
        .expect(422, {
          type: ProblemException.createType('invalid-asyncapi-document'),
          title: 'Invalid AsyncAPI Document',
          status: 422,
          detail: 'The provided AsyncAPI document is invalid.',
          diagnostics: [
            {
              code: 'asyncapi-defaultContentType',
              message: 'AsyncAPI document should have "defaultContentType" field.',
              path: [],
              severity: 1,
              range: {
                start: {
                  line: 0,
                  character: 0
                },
                end: {
                  line: 0,
                  character: 76
                }
              }
            },
            {
              code: 'asyncapi-id',
              message: 'AsyncAPI document should have "id" field.',
              path: [],
              severity: 1,
              range: {
                start: {
                  line: 0,
                  character: 0
                },
                end: {
                  line: 0,
                  character: 76
                }
              }
            },
            {
              code: 'asyncapi-servers',
              message: 'AsyncAPI document should have non-empty "servers" object.',
              path: [],
              severity: 1,
              range: {
                start: {
                  line: 0,
                  character: 0
                },
                end: {
                  line: 0,
                  character: 76
                }
              }
            },
            {
              code: 'asyncapi2-tags',
              message: 'AsyncAPI object should have non-empty "tags" array.',
              path: [],
              severity: 1,
              range: {
                start: {
                  line: 0,
                  character: 0
                },
                end: {
                  line: 0,
                  character: 76
                }
              }
            },
            {
              code: 'asyncapi-latest-version',
              message: 'The latest version of AsyncAPi is not used. It is recommended update to the "3.0.0" version.',
              path: [
                'asyncapi'
              ],
              severity: 2,
              range: {
                start: {
                  line: 0,
                  character: 12
                },
                end: {
                  line: 0,
                  character: 19
                }
              }
            },
            {
              code: 'asyncapi-document-resolved',
              message: '"info" property must have required property "title"',
              path: [
                'info'
              ],
              severity: 0,
              range: {
                start: {
                  line: 0,
                  character: 27
                },
                end: {
                  line: 0,
                  character: 61
                }
              }
            },
            {
              code: 'asyncapi-info-contact',
              message: 'Info object should have "contact" object.',
              path: [
                'info'
              ],
              severity: 1,
              range: {
                start: {
                  line: 0,
                  character: 27
                },
                end: {
                  line: 0,
                  character: 61
                }
              }
            },
            {
              code: 'asyncapi-info-description',
              message: 'Info "description" should be present and non-empty string.',
              path: [
                'info'
              ],
              severity: 1,
              range: {
                start: {
                  line: 0,
                  character: 27
                },
                end: {
                  line: 0,
                  character: 61
                }
              }
            },
            {
              code: 'asyncapi-info-license',
              message: 'Info object should have "license" object.',
              path: [
                'info'
              ],
              severity: 1,
              range: {
                start: {
                  line: 0,
                  character: 27
                },
                end: {
                  line: 0,
                  character: 61
                }
              }
            },
            {
              code: 'asyncapi-document-resolved',
              message: 'Property "tite" is not expected to be here',
              path: [
                'info',
                'tite'
              ],
              severity: 0,
              range: {
                start: {
                  line: 0,
                  character: 35
                },
                end: {
                  line: 0,
                  character: 43
                }
              }
            }
          ]
        }
        );
    });
  });
});
