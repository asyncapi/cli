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
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).toEqual(
          '"{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/protocol\\",\\n      \\"before\\": \\"mqtt\\",\\n      \\"after\\": \\"http\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/url\\",\\n      \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n      \\"after\\": \\"http://test.mosquitto.org\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"Streetlights API\\",\\n      \\"after\\": \\"Streetlights API V2\\",\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n"'
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
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).toEqual(
          '"[\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/info/title\\",\\n    \\"before\\": \\"Streetlights API\\",\\n    \\"after\\": \\"Streetlights API V2\\",\\n    \\"type\\": \\"non-breaking\\"\\n  }\\n]\\n"'
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
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).toEqual(
          '"[\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\",\\n    \\"before\\": 0,\\n    \\"after\\": 1,\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n    \\"before\\": 0,\\n    \\"after\\": 1,\\n    \\"type\\": \\"unclassified\\"\\n  }\\n]\\n"'
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
      ])
      // eslint-disable-next-line sonarjs/no-identical-functions
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).toEqual(
          '"{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/protocol\\",\\n      \\"before\\": \\"mqtt\\",\\n      \\"after\\": \\"http\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/url\\",\\n      \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n      \\"after\\": \\"http://test.mosquitto.org\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"Streetlights API\\",\\n      \\"after\\": \\"Streetlights API V2\\",\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n"'
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
      ])
      .it((ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).toEqual(
          '"{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/protocol\\",\\n      \\"before\\": \\"mqtt\\",\\n      \\"after\\": \\"http\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/url\\",\\n      \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n      \\"after\\": \\"http://test.mosquitto.org\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"Streetlights API\\",\\n      \\"after\\": \\"Streetlights API V2\\",\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n"'
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
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).toEqual(
          '"changes:\\n  - action: edit\\n    path: >-\\n      /channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\n    before: 0\\n    after: 1\\n    type: unclassified\\n  - action: edit\\n    path: /channels/light~1measured/publish/message/payload/properties/id/minimum\\n    before: 0\\n    after: 1\\n    type: unclassified\\n  - action: edit\\n    path: /servers/mosquitto/protocol\\n    before: mqtt\\n    after: http\\n    type: unclassified\\n  - action: edit\\n    path: /servers/mosquitto/url\\n    before: mqtt://test.mosquitto.org\\n    after: http://test.mosquitto.org\\n    type: breaking\\n  - action: edit\\n    path: /info/title\\n    before: Streetlights API\\n    after: Streetlights API V2\\n    type: non-breaking\\n\\n"'
        );
        expect(ctx.stderr).toEqual('');
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
        done();
      });
  });
});
