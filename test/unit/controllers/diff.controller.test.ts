import request from 'supertest';

import './setup.test';
import { App } from '../../../src/apps/api/app';
import { ProblemException } from '../../../src/apps/api/exceptions/problem.exception';

import { DiffController } from '../../../src/apps/api/controllers/diff.controller';

describe('DiffController', () => {
  describe('[POST] /diff', () => {
    it('should diff AsyncAPI documents', async () => {
      const app = new App([new DiffController()]);
      await app.init();

      await request(app.getServer())
        .post('/v1/diff')
        .send({
          asyncapis: [
            {
              asyncapi: '2.3.0',
              info: {
                title: 'Super test',
                version: '1.0.0'
              },
              channels: {
                'test-channel-1': {
                  publish: {
                    message: {
                      payload: {
                        type: 'object',
                      },
                    },
                  }
                },
              },
            },
            {
              asyncapi: '2.3.0',
              info: {
                title: 'Changed super test',
                version: '1.1.0'
              },
              channels: {
                'test-channel-1': {
                  publish: {
                    message: {
                      payload: {
                        type: 'object',
                      },
                    },
                  }
                },
              },
            }, 
          ],
        })
        .expect(200, {
          diff: {
            changes: [
              {
                action: 'edit',
                path: '/info/version',
                before: '1.0.0',
                after: '1.1.0',
                type: 'breaking',
              },
              {
                action: 'edit',
                path: '/info/title',
                before: 'Super test',
                after: 'Changed super test',
                type: 'non-breaking',
              },
            ],
          }
        });
    });

    it('should throw error with invalid AsyncAPI document', async () => {
      const app = new App([new DiffController()]);
      await app.init();

      await request(app.getServer())
        .post('/v1/diff')
        .send({
          asyncapis: [
            {
              asyncapi: '2.2.0',
              info: {
                title: 'Test Service',
                version: '1.0.0',
              },
              channels: {
                'test-channel-2': {
                  publish: {
                    message: {
                      payload: {
                        type: 'object',
                      },
                    },
                  }
                },
              },
            },
            {
              asyncapi: '2.2.0',
              info: {
                tite: 'My API', // spelled wrong on purpose to throw an error in the test
                version: '1.0.0'
              },
              channels: {},
            }
          ],
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
              message: 'The latest version of AsyncAPi is not used. It is recommended update to the "3.1.0" version.',
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
        });
    });
  });    
});
