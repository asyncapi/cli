/* eslint-disable sonarjs/no-duplicate-string */
import { test } from '@oclif/test';

describe('diff', () => {
  jest.setTimeout(100000);
  
  describe('with file paths, and there are no difference between the files', () => {
    test
      .stderr()
      .stdout()
      .command(['diff', './test/specification.yml', './test/specification.yml', '--format=json'])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).toEqual(
          '"{\\n  \\"changes\\": []\\n}\\n"'
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });
  
  describe('yaml output: with file paths, and there are no difference between the files', () => {
    test
      .stderr()
      .stdout()
      .command(['diff', './test/specification.yml', './test/specification.yml'])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).toEqual(
          '"changes: []\\n\\n"'
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('with file paths, and getting all changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--type=all',
        '--format=json',
        '--no-error',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-1>\\",\\n      \\"after\\": \\"<anonymous-schema-4>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-4>\\",\\n      \\"after\\": \\"<anonymous-schema-7>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-3>\\",\\n      \\"after\\": \\"<anonymous-schema-6>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-2>\\",\\n      \\"after\\": \\"<anonymous-schema-5>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"add\\",\\n      \\"path\\": \\"/channels/user~1signedup\\",\\n      \\"after\\": {\\n        \\"subscribe\\": {\\n          \\"message\\": {\\n            \\"payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                }\\n              },\\n              \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n            },\\n            \\"x-parser-original-schema-format\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n            \\"x-parser-original-payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\"\\n                }\\n              }\\n            },\\n            \\"schemaFormat\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n            \\"x-parser-message-parsed\\": true,\\n            \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n          }\\n        }\\n      },\\n      \\"type\\": \\"non-breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/protocol\\",\\n      \\"before\\": \\"mqtt\\",\\n      \\"after\\": \\"http\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/url\\",\\n      \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n      \\"after\\": \\"http://test.mosquitto.org\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"Streetlights API\\",\\n      \\"after\\": \\"Streetlights API V2\\",\\n      \\"type\\": \\"non-breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"add\\",\\n      \\"path\\": \\"/components\\",\\n      \\"after\\": {\\n        \\"messages\\": {\\n          \\"UserSignedUp\\": {\\n            \\"payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                }\\n              },\\n              \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n            },\\n            \\"x-parser-original-schema-format\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n            \\"x-parser-original-payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\"\\n                }\\n              }\\n            },\\n            \\"schemaFormat\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n            \\"x-parser-message-parsed\\": true,\\n            \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n          }\\n        }\\n      },\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n"' 
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('with file paths, and getting breaking changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--type=breaking',
        '--format=json',
        '--no-error',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).toEqual(
          '"[\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/servers/mosquitto/protocol\\",\\n    \\"before\\": \\"mqtt\\",\\n    \\"after\\": \\"http\\",\\n    \\"type\\": \\"breaking\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/servers/mosquitto/url\\",\\n    \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n    \\"after\\": \\"http://test.mosquitto.org\\",\\n    \\"type\\": \\"breaking\\"\\n  }\\n]\\n"'
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('with file paths, and getting non-breaking changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--type=non-breaking',
        '--format=json',
        '--no-error',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"[\\n  {\\n    \\"action\\": \\"add\\",\\n    \\"path\\": \\"/channels/user~1signedup\\",\\n    \\"after\\": {\\n      \\"subscribe\\": {\\n        \\"message\\": {\\n          \\"payload\\": {\\n            \\"type\\": \\"object\\",\\n            \\"properties\\": {\\n              \\"displayName\\": {\\n                \\"type\\": \\"string\\",\\n                \\"description\\": \\"Name of the user\\",\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n              },\\n              \\"email\\": {\\n                \\"type\\": \\"string\\",\\n                \\"format\\": \\"email\\",\\n                \\"description\\": \\"Email of the user\\",\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n              }\\n            },\\n            \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n          },\\n          \\"x-parser-original-schema-format\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n          \\"x-parser-original-payload\\": {\\n            \\"type\\": \\"object\\",\\n            \\"properties\\": {\\n              \\"displayName\\": {\\n                \\"type\\": \\"string\\",\\n                \\"description\\": \\"Name of the user\\"\\n              },\\n              \\"email\\": {\\n                \\"type\\": \\"string\\",\\n                \\"format\\": \\"email\\",\\n                \\"description\\": \\"Email of the user\\"\\n              }\\n            }\\n          },\\n          \\"schemaFormat\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n          \\"x-parser-message-parsed\\": true,\\n          \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n        }\\n      }\\n    },\\n    \\"type\\": \\"non-breaking\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/info/title\\",\\n    \\"before\\": \\"Streetlights API\\",\\n    \\"after\\": \\"Streetlights API V2\\",\\n    \\"type\\": \\"non-breaking\\"\\n  },\\n  {\\n    \\"action\\": \\"add\\",\\n    \\"path\\": \\"/components\\",\\n    \\"after\\": {\\n      \\"messages\\": {\\n        \\"UserSignedUp\\": {\\n          \\"payload\\": {\\n            \\"type\\": \\"object\\",\\n            \\"properties\\": {\\n              \\"displayName\\": {\\n                \\"type\\": \\"string\\",\\n                \\"description\\": \\"Name of the user\\",\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n              },\\n              \\"email\\": {\\n                \\"type\\": \\"string\\",\\n                \\"format\\": \\"email\\",\\n                \\"description\\": \\"Email of the user\\",\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n              }\\n            },\\n            \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n          },\\n          \\"x-parser-original-schema-format\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n          \\"x-parser-original-payload\\": {\\n            \\"type\\": \\"object\\",\\n            \\"properties\\": {\\n              \\"displayName\\": {\\n                \\"type\\": \\"string\\",\\n                \\"description\\": \\"Name of the user\\"\\n              },\\n              \\"email\\": {\\n                \\"type\\": \\"string\\",\\n                \\"format\\": \\"email\\",\\n                \\"description\\": \\"Email of the user\\"\\n              }\\n            }\\n          },\\n          \\"schemaFormat\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n          \\"x-parser-message-parsed\\": true,\\n          \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n        }\\n      }\\n    },\\n    \\"type\\": \\"non-breaking\\"\\n  }\\n]\\n"' 
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('with file paths, and getting unclassified changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--type=unclassified',
        '--format=json',
        '--no-error',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"[\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\",\\n    \\"before\\": 0,\\n    \\"after\\": 1,\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/x-parser-schema-id\\",\\n    \\"before\\": \\"<anonymous-schema-1>\\",\\n    \\"after\\": \\"<anonymous-schema-4>\\",\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id\\",\\n    \\"before\\": \\"<anonymous-schema-4>\\",\\n    \\"after\\": \\"<anonymous-schema-7>\\",\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id\\",\\n    \\"before\\": \\"<anonymous-schema-3>\\",\\n    \\"after\\": \\"<anonymous-schema-6>\\",\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id\\",\\n    \\"before\\": \\"<anonymous-schema-2>\\",\\n    \\"after\\": \\"<anonymous-schema-5>\\",\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n    \\"before\\": 0,\\n    \\"after\\": 1,\\n    \\"type\\": \\"unclassified\\"\\n  }\\n]\\n"' 
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('with file paths, and getting all changes, passing flag', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--format=json',
        '--no-error',
      ])
      // eslint-disable-next-line sonarjs/no-identical-functions
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-1>\\",\\n      \\"after\\": \\"<anonymous-schema-4>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-4>\\",\\n      \\"after\\": \\"<anonymous-schema-7>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-3>\\",\\n      \\"after\\": \\"<anonymous-schema-6>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-2>\\",\\n      \\"after\\": \\"<anonymous-schema-5>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"add\\",\\n      \\"path\\": \\"/channels/user~1signedup\\",\\n      \\"after\\": {\\n        \\"subscribe\\": {\\n          \\"message\\": {\\n            \\"payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                }\\n              },\\n              \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n            },\\n            \\"x-parser-original-schema-format\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n            \\"x-parser-original-payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\"\\n                }\\n              }\\n            },\\n            \\"schemaFormat\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n            \\"x-parser-message-parsed\\": true,\\n            \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n          }\\n        }\\n      },\\n      \\"type\\": \\"non-breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/protocol\\",\\n      \\"before\\": \\"mqtt\\",\\n      \\"after\\": \\"http\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/url\\",\\n      \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n      \\"after\\": \\"http://test.mosquitto.org\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"Streetlights API\\",\\n      \\"after\\": \\"Streetlights API V2\\",\\n      \\"type\\": \\"non-breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"add\\",\\n      \\"path\\": \\"/components\\",\\n      \\"after\\": {\\n        \\"messages\\": {\\n          \\"UserSignedUp\\": {\\n            \\"payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                }\\n              },\\n              \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n            },\\n            \\"x-parser-original-schema-format\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n            \\"x-parser-original-payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\"\\n                }\\n              }\\n            },\\n            \\"schemaFormat\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n            \\"x-parser-message-parsed\\": true,\\n            \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n          }\\n        }\\n      },\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n"'
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('with custom standard file', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--overrides=./test/fixtures/overrides.json',
        '--format=json',
        '--no-error',
      ])
      .it((ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-1>\\",\\n      \\"after\\": \\"<anonymous-schema-4>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-4>\\",\\n      \\"after\\": \\"<anonymous-schema-7>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-3>\\",\\n      \\"after\\": \\"<anonymous-schema-6>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id\\",\\n      \\"before\\": \\"<anonymous-schema-2>\\",\\n      \\"after\\": \\"<anonymous-schema-5>\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"add\\",\\n      \\"path\\": \\"/channels/user~1signedup\\",\\n      \\"after\\": {\\n        \\"subscribe\\": {\\n          \\"message\\": {\\n            \\"payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                }\\n              },\\n              \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n            },\\n            \\"x-parser-original-schema-format\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n            \\"x-parser-original-payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\"\\n                }\\n              }\\n            },\\n            \\"schemaFormat\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n            \\"x-parser-message-parsed\\": true,\\n            \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n          }\\n        }\\n      },\\n      \\"type\\": \\"non-breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/protocol\\",\\n      \\"before\\": \\"mqtt\\",\\n      \\"after\\": \\"http\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/url\\",\\n      \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n      \\"after\\": \\"http://test.mosquitto.org\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"Streetlights API\\",\\n      \\"after\\": \\"Streetlights API V2\\",\\n      \\"type\\": \\"non-breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"add\\",\\n      \\"path\\": \\"/components\\",\\n      \\"after\\": {\\n        \\"messages\\": {\\n          \\"UserSignedUp\\": {\\n            \\"payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\",\\n                  \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                }\\n              },\\n              \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n            },\\n            \\"x-parser-original-schema-format\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n            \\"x-parser-original-payload\\": {\\n              \\"type\\": \\"object\\",\\n              \\"properties\\": {\\n                \\"displayName\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"description\\": \\"Name of the user\\"\\n                },\\n                \\"email\\": {\\n                  \\"type\\": \\"string\\",\\n                  \\"format\\": \\"email\\",\\n                  \\"description\\": \\"Email of the user\\"\\n                }\\n              }\\n            },\\n            \\"schemaFormat\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n            \\"x-parser-message-parsed\\": true,\\n            \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n          }\\n        }\\n      },\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n"'
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('should throw error for invalid override path', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--overrides=./overrides-wrong.json',
        '--format=json',
      ])
      .it((ctx, done) => {
        expect(ctx.stdout).toEqual('');
        expect(ctx.stderr).toEqual(
          'DiffOverrideFileError: Override file not found\n'
        );
        done();
      });
  });

  describe('should throw error for invalid override json', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--overrides=./test/fixtures/invalid-overrides.json',
      ])
      .it((ctx, done) => {
        expect(ctx.stdout).toEqual('');
        expect(ctx.stderr).toEqual(
          'DiffOverrideJSONError: Provided override file is not a valid JSON file\n'
        );
        done();
      });
  });

  describe('YAML output, getting all changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
        '--type=all',
        '--no-error',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"changes:\\n  - action: edit\\n    path: >-\\n      /channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\n    before: 0\\n    after: 1\\n    type: unclassified\\n  - action: edit\\n    path: /channels/light~1measured/publish/message/payload/x-parser-schema-id\\n    before: <anonymous-schema-1>\\n    after: <anonymous-schema-4>\\n    type: unclassified\\n  - action: edit\\n    path: >-\\n      /channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id\\n    before: <anonymous-schema-4>\\n    after: <anonymous-schema-7>\\n    type: unclassified\\n  - action: edit\\n    path: >-\\n      /channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id\\n    before: <anonymous-schema-3>\\n    after: <anonymous-schema-6>\\n    type: unclassified\\n  - action: edit\\n    path: >-\\n      /channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id\\n    before: <anonymous-schema-2>\\n    after: <anonymous-schema-5>\\n    type: unclassified\\n  - action: edit\\n    path: /channels/light~1measured/publish/message/payload/properties/id/minimum\\n    before: 0\\n    after: 1\\n    type: unclassified\\n  - action: add\\n    path: /channels/user~1signedup\\n    after:\\n      subscribe:\\n        message:\\n          payload:\\n            type: object\\n            properties:\\n              displayName:\\n                type: string\\n                description: Name of the user\\n                x-parser-schema-id: <anonymous-schema-2>\\n              email:\\n                type: string\\n                format: email\\n                description: Email of the user\\n                x-parser-schema-id: <anonymous-schema-3>\\n            x-parser-schema-id: <anonymous-schema-1>\\n          x-parser-original-schema-format: application/vnd.aai.asyncapi;version=2.1.0\\n          x-parser-original-payload:\\n            type: object\\n            properties:\\n              displayName:\\n                type: string\\n                description: Name of the user\\n              email:\\n                type: string\\n                format: email\\n                description: Email of the user\\n          schemaFormat: application/vnd.aai.asyncapi;version=2.1.0\\n          x-parser-message-parsed: true\\n          x-parser-message-name: UserSignedUp\\n    type: non-breaking\\n  - action: edit\\n    path: /servers/mosquitto/protocol\\n    before: mqtt\\n    after: http\\n    type: unclassified\\n  - action: edit\\n    path: /servers/mosquitto/url\\n    before: mqtt://test.mosquitto.org\\n    after: http://test.mosquitto.org\\n    type: breaking\\n  - action: edit\\n    path: /info/title\\n    before: Streetlights API\\n    after: Streetlights API V2\\n    type: non-breaking\\n  - action: add\\n    path: /components\\n    after:\\n      messages:\\n        UserSignedUp:\\n          payload:\\n            type: object\\n            properties:\\n              displayName:\\n                type: string\\n                description: Name of the user\\n                x-parser-schema-id: <anonymous-schema-2>\\n              email:\\n                type: string\\n                format: email\\n                description: Email of the user\\n                x-parser-schema-id: <anonymous-schema-3>\\n            x-parser-schema-id: <anonymous-schema-1>\\n          x-parser-original-schema-format: application/vnd.aai.asyncapi;version=2.1.0\\n          x-parser-original-payload:\\n            type: object\\n            properties:\\n              displayName:\\n                type: string\\n                description: Name of the user\\n              email:\\n                type: string\\n                format: email\\n                description: Email of the user\\n          schemaFormat: application/vnd.aai.asyncapi;version=2.1.0\\n          x-parser-message-parsed: true\\n          x-parser-message-name: UserSignedUp\\n    type: non-breaking\\n\\n"' 
        );
        expect(ctx.stderr).toEqual('');
        done();
      });
  });

  describe('should show error on breaking changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/asyncapi_v1.yml',
        './test/fixtures/asyncapi_v2.yml',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).toEqual(
          '"changes:\\n  - action: edit\\n    path: >-\\n      /channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\n    before: 0\\n    after: 1\\n    type: unclassified\\n  - action: edit\\n    path: /channels/light~1measured/publish/message/payload/properties/id/minimum\\n    before: 0\\n    after: 1\\n    type: unclassified\\n  - action: edit\\n    path: /servers/mosquitto/protocol\\n    before: mqtt\\n    after: http\\n    type: unclassified\\n  - action: edit\\n    path: /servers/mosquitto/url\\n    before: mqtt://test.mosquitto.org\\n    after: http://test.mosquitto.org\\n    type: breaking\\n  - action: edit\\n    path: /info/title\\n    before: Streetlights API\\n    after: Streetlights API V2\\n    type: non-breaking\\n\\n"'
        );
        expect(ctx.stderr).toEqual('DiffBreakingChangeError: Breaking changes detected\n');
        done();
      });
  });

  describe('with logging diagnostics', () => {
    test
      .stderr()
      .stdout()
      .command(['diff', './test/specification.yml', './test/specification.yml', '--format=json', '--log-diagnostics'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).toMatch(
          'File ./test/specification.yml is valid but has (itself and/or referenced documents) governance issues.'
        );
        expect(ctx.stderr).toEqual('');
      });
  });

  describe('Markdown output with subtype as json, getting all changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/specification_v1.yml',
        './test/fixtures/specification_v2.yml',
        '--format=md',
        '--type=all',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"## Unclassified\\n\\n\\n - **Path**: `/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum`\\n     - **Action**: edit\\n     - **Before**: 0\\n     - **After**: 1\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-1>\\n     - **After**: <anonymous-schema-4>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-4>\\n     - **After**: <anonymous-schema-7>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-3>\\n     - **After**: <anonymous-schema-6>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-2>\\n     - **After**: <anonymous-schema-5>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/id/minimum`\\n     - **Action**: edit\\n     - **Before**: 0\\n     - **After**: 1\\n    \\n - **Path**: `/servers/mosquitto/protocol`\\n     - **Action**: edit\\n     - **Before**: mqtt\\n     - **After**: http\\n    \\n\\n## Non-breaking\\n\\n\\n - **Path**: `/channels/user~1signedup`\\n     - **Action**: add\\n     - <details>\\n            <summary> After </summary>\\n            \\n        ```json\\n        {\\n          \\"subscribe\\": {\\n            \\"message\\": {\\n              \\"payload\\": {\\n                \\"type\\": \\"object\\",\\n                \\"properties\\": {\\n                  \\"displayName\\": {\\n                    \\"type\\": \\"string\\",\\n                    \\"description\\": \\"Name of the user\\",\\n                    \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                  },\\n                  \\"email\\": {\\n                    \\"type\\": \\"string\\",\\n                    \\"format\\": \\"email\\",\\n                    \\"description\\": \\"Email of the user\\",\\n                    \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                  }\\n                },\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n              },\\n              \\"x-parser-original-schema-format\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n              \\"x-parser-original-payload\\": {\\n                \\"type\\": \\"object\\",\\n                \\"properties\\": {\\n                  \\"displayName\\": {\\n                    \\"type\\": \\"string\\",\\n                    \\"description\\": \\"Name of the user\\"\\n                  },\\n                  \\"email\\": {\\n                    \\"type\\": \\"string\\",\\n                    \\"format\\": \\"email\\",\\n                    \\"description\\": \\"Email of the user\\"\\n                  }\\n                }\\n              },\\n              \\"schemaFormat\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n              \\"x-parser-message-parsed\\": true,\\n              \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n            }\\n          }\\n        }\\n        ```            \\n        </details>  \\n        \\n    \\n - **Path**: `/info/title`\\n     - **Action**: edit\\n     - **Before**: Streetlights API\\n     - **After**: Streetlights API V2\\n    \\n - **Path**: `/components`\\n     - **Action**: add\\n     - <details>\\n            <summary> After </summary>\\n            \\n        ```json\\n        {\\n          \\"messages\\": {\\n            \\"UserSignedUp\\": {\\n              \\"payload\\": {\\n                \\"type\\": \\"object\\",\\n                \\"properties\\": {\\n                  \\"displayName\\": {\\n                    \\"type\\": \\"string\\",\\n                    \\"description\\": \\"Name of the user\\",\\n                    \\"x-parser-schema-id\\": \\"<anonymous-schema-2>\\"\\n                  },\\n                  \\"email\\": {\\n                    \\"type\\": \\"string\\",\\n                    \\"format\\": \\"email\\",\\n                    \\"description\\": \\"Email of the user\\",\\n                    \\"x-parser-schema-id\\": \\"<anonymous-schema-3>\\"\\n                  }\\n                },\\n                \\"x-parser-schema-id\\": \\"<anonymous-schema-1>\\"\\n              },\\n              \\"x-parser-original-schema-format\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n              \\"x-parser-original-payload\\": {\\n                \\"type\\": \\"object\\",\\n                \\"properties\\": {\\n                  \\"displayName\\": {\\n                    \\"type\\": \\"string\\",\\n                    \\"description\\": \\"Name of the user\\"\\n                  },\\n                  \\"email\\": {\\n                    \\"type\\": \\"string\\",\\n                    \\"format\\": \\"email\\",\\n                    \\"description\\": \\"Email of the user\\"\\n                  }\\n                }\\n              },\\n              \\"schemaFormat\\": \\"application/vnd.aai.asyncapi;version=2.1.0\\",\\n              \\"x-parser-message-parsed\\": true,\\n              \\"x-parser-message-name\\": \\"UserSignedUp\\"\\n            }\\n          }\\n        }\\n        ```            \\n        </details>  \\n        \\n    \\n\\n## Breaking\\n\\n\\n - **Path**: `/servers/mosquitto/url`\\n     - **Action**: edit\\n     - **Before**: mqtt://test.mosquitto.org\\n     - **After**: http://test.mosquitto.org\\n    \\n\\n"' 
        );
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('Markdown output with subtype as yaml, getting all changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/specification_v1.yml',
        './test/fixtures/specification_v2.yml',
        '--format=md',
        '--markdownSubtype=yaml',
        '--type=all',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"## Unclassified\\n\\n\\n - **Path**: `/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum`\\n     - **Action**: edit\\n     - **Before**: 0\\n     - **After**: 1\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-1>\\n     - **After**: <anonymous-schema-4>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/sentAt/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-4>\\n     - **After**: <anonymous-schema-7>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/lumens/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-3>\\n     - **After**: <anonymous-schema-6>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/id/x-parser-schema-id`\\n     - **Action**: edit\\n     - **Before**: <anonymous-schema-2>\\n     - **After**: <anonymous-schema-5>\\n    \\n - **Path**: `/channels/light~1measured/publish/message/payload/properties/id/minimum`\\n     - **Action**: edit\\n     - **Before**: 0\\n     - **After**: 1\\n    \\n - **Path**: `/servers/mosquitto/protocol`\\n     - **Action**: edit\\n     - **Before**: mqtt\\n     - **After**: http\\n    \\n\\n## Non-breaking\\n\\n\\n - **Path**: `/channels/user~1signedup`\\n     - **Action**: add\\n     - <details>\\n            <summary> After </summary>\\n            \\n        ```yaml\\n        subscribe:\\n          message:\\n            payload:\\n              type: object\\n              properties:\\n                displayName:\\n                  type: string\\n                  description: Name of the user\\n                  x-parser-schema-id: <anonymous-schema-2>\\n                email:\\n                  type: string\\n                  format: email\\n                  description: Email of the user\\n                  x-parser-schema-id: <anonymous-schema-3>\\n              x-parser-schema-id: <anonymous-schema-1>\\n            x-parser-original-schema-format: application/vnd.aai.asyncapi;version=2.1.0\\n            x-parser-original-payload:\\n              type: object\\n              properties:\\n                displayName:\\n                  type: string\\n                  description: Name of the user\\n                email:\\n                  type: string\\n                  format: email\\n                  description: Email of the user\\n            schemaFormat: application/vnd.aai.asyncapi;version=2.1.0\\n            x-parser-message-parsed: true\\n            x-parser-message-name: UserSignedUp\\n        \\n        ```            \\n        </details>  \\n        \\n    \\n - **Path**: `/info/title`\\n     - **Action**: edit\\n     - **Before**: Streetlights API\\n     - **After**: Streetlights API V2\\n    \\n - **Path**: `/components`\\n     - **Action**: add\\n     - <details>\\n            <summary> After </summary>\\n            \\n        ```yaml\\n        messages:\\n          UserSignedUp:\\n            payload:\\n              type: object\\n              properties:\\n                displayName:\\n                  type: string\\n                  description: Name of the user\\n                  x-parser-schema-id: <anonymous-schema-2>\\n                email:\\n                  type: string\\n                  format: email\\n                  description: Email of the user\\n                  x-parser-schema-id: <anonymous-schema-3>\\n              x-parser-schema-id: <anonymous-schema-1>\\n            x-parser-original-schema-format: application/vnd.aai.asyncapi;version=2.1.0\\n            x-parser-original-payload:\\n              type: object\\n              properties:\\n                displayName:\\n                  type: string\\n                  description: Name of the user\\n                email:\\n                  type: string\\n                  format: email\\n                  description: Email of the user\\n            schemaFormat: application/vnd.aai.asyncapi;version=2.1.0\\n            x-parser-message-parsed: true\\n            x-parser-message-name: UserSignedUp\\n        \\n        ```            \\n        </details>  \\n        \\n    \\n\\n## Breaking\\n\\n\\n - **Path**: `/servers/mosquitto/url`\\n     - **Action**: edit\\n     - **Before**: mqtt://test.mosquitto.org\\n     - **After**: http://test.mosquitto.org\\n    \\n\\n"'
        );
        expect(ctx.stderr).to.equal('');
        done();
      });
  });
});
