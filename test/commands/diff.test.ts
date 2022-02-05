/* eslint-disable sonarjs/no-duplicate-string */
import { expect, test } from '@oclif/test';

describe('diff', () => {
  describe('with file paths, and there are no difference between the files', () => {
    test
      .stderr()
      .stdout()
      .command(['diff', './test/specification.yml', './test/specification.yml'])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"{\\n  \\"changes\\": []\\n}\\n"'
        );
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with file paths, and getting all changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/specification_v1.yml',
        './test/fixtures/specification_v2.yml',
        '--type=all',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/protocol\\",\\n      \\"before\\": \\"mqtt\\",\\n      \\"after\\": \\"http\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/url\\",\\n      \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n      \\"after\\": \\"http://test.mosquitto.org\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"Streetlights API\\",\\n      \\"after\\": \\"Streetlights API V2\\",\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n"'
        );
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with file paths, and getting breaking changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/specification_v1.yml',
        './test/fixtures/specification_v2.yml',
        '--type=breaking',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"[\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/servers/mosquitto/protocol\\",\\n    \\"before\\": \\"mqtt\\",\\n    \\"after\\": \\"http\\",\\n    \\"type\\": \\"breaking\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/servers/mosquitto/url\\",\\n    \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n    \\"after\\": \\"http://test.mosquitto.org\\",\\n    \\"type\\": \\"breaking\\"\\n  }\\n]\\n"'
        );
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with file paths, and getting non-breaking changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/specification_v1.yml',
        './test/fixtures/specification_v2.yml',
        '--type=non-breaking',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"[\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/info/title\\",\\n    \\"before\\": \\"Streetlights API\\",\\n    \\"after\\": \\"Streetlights API V2\\",\\n    \\"type\\": \\"non-breaking\\"\\n  }\\n]\\n"'
        );
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with file paths, and getting unclassified changes', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/specification_v1.yml',
        './test/fixtures/specification_v2.yml',
        '--type=unclassified',
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"[\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\",\\n    \\"before\\": 0,\\n    \\"after\\": 1,\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n    \\"before\\": 0,\\n    \\"after\\": 1,\\n    \\"type\\": \\"unclassified\\"\\n  }\\n]\\n"'
        );
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with file paths, and getting all changes, passing flag', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/specification_v1.yml',
        './test/fixtures/specification_v2.yml',
        '--format=json',
      ])
      // eslint-disable-next-line sonarjs/no-identical-functions
      .it('works when file path is passed', (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/protocol\\",\\n      \\"before\\": \\"mqtt\\",\\n      \\"after\\": \\"http\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/url\\",\\n      \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n      \\"after\\": \\"http://test.mosquitto.org\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"Streetlights API\\",\\n      \\"after\\": \\"Streetlights API V2\\",\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n"'
        );
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with custom standard file', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/specification_v1.yml',
        './test/fixtures/specification_v2.yml',
        '--overrides=./test/fixtures/overrides.json',
      ])
      .it((ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/protocol\\",\\n      \\"before\\": \\"mqtt\\",\\n      \\"after\\": \\"http\\",\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/url\\",\\n      \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n      \\"after\\": \\"http://test.mosquitto.org\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"Streetlights API\\",\\n      \\"after\\": \\"Streetlights API V2\\",\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n"'
        );
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('should throw error for invalid override path', () => {
    test
      .stderr()
      .stdout()
      .command([
        'diff',
        './test/fixtures/specification_v1.yml',
        './test/fixtures/specification_v2.yml',
        '--overrides=./overrides-wrong.json',
      ])
      .it((ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal(
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
        './test/fixtures/specification_v1.yml',
        './test/fixtures/specification_v2.yml',
        '--overrides=./test/fixtures/invalid-overrides.json',
      ])
      .it((ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal(
          'DiffOverrideJSONError: Provided override file is not a valid JSON file\n'
        );
        done();
      });
  });
});
