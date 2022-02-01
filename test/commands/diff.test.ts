/* eslint-disable sonarjs/no-duplicate-string */
import { expect, test } from '@oclif/test';

describe('diff', () => {
  test
    .stderr()
    .stdout()
    .command(['diff', './test/specification.yml', './test/specification.yml'])
    .it(
      'with file paths, and there are no difference between the files',
      (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"{\\n  \\"changes\\": []\\n}\\n"'
        );
        expect(ctx.stderr).to.equal('');
        done();
      }
    );

  test
    .stderr()
    .stdout()
    .command([
      'diff',
      './test/fixtures/specification_v1.yml',
      './test/fixtures/specification_v2.yml',
      '--type=all',
    ])
    .it('with file paths, and getting all changes', (ctx, done) => {
      expect(JSON.stringify(ctx.stdout)).to.equal(
        '"{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/protocol\\",\\n      \\"before\\": \\"mqtt\\",\\n      \\"after\\": \\"http\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/url\\",\\n      \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n      \\"after\\": \\"http://test.mosquitto.org\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"Streetlights API\\",\\n      \\"after\\": \\"Streetlights API V2\\",\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n"'
      );
      expect(ctx.stderr).to.equal('');
      done();
    });

  test
    .stderr()
    .stdout()
    .command([
      'diff',
      './test/fixtures/specification_v1.yml',
      './test/fixtures/specification_v2.yml',
      '--type=breaking',
    ])
    .it('with file paths, and getting breaking changes', (ctx, done) => {
      expect(JSON.stringify(ctx.stdout)).to.equal(
        '"[\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/servers/mosquitto/protocol\\",\\n    \\"before\\": \\"mqtt\\",\\n    \\"after\\": \\"http\\",\\n    \\"type\\": \\"breaking\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/servers/mosquitto/url\\",\\n    \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n    \\"after\\": \\"http://test.mosquitto.org\\",\\n    \\"type\\": \\"breaking\\"\\n  }\\n]\\n"'
      );
      expect(ctx.stderr).to.equal('');
      done();
    });

  test
    .stderr()
    .stdout()
    .command([
      'diff',
      './test/fixtures/specification_v1.yml',
      './test/fixtures/specification_v2.yml',
      '--type=non-breaking',
    ])
    .it('with file paths, and getting non-breaking changes', (ctx, done) => {
      expect(JSON.stringify(ctx.stdout)).to.equal(
        '"[\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/info/title\\",\\n    \\"before\\": \\"Streetlights API\\",\\n    \\"after\\": \\"Streetlights API V2\\",\\n    \\"type\\": \\"non-breaking\\"\\n  }\\n]\\n"'
      );
      expect(ctx.stderr).to.equal('');
      done();
    });

  test
    .stderr()
    .stdout()
    .command([
      'diff',
      './test/fixtures/specification_v1.yml',
      './test/fixtures/specification_v2.yml',
      '--type=unclassified',
    ])
    .it('with file paths, and getting unclassified changes', (ctx, done) => {
      expect(JSON.stringify(ctx.stdout)).to.equal(
        '"[\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\",\\n    \\"before\\": 0,\\n    \\"after\\": 1,\\n    \\"type\\": \\"unclassified\\"\\n  },\\n  {\\n    \\"action\\": \\"edit\\",\\n    \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n    \\"before\\": 0,\\n    \\"after\\": 1,\\n    \\"type\\": \\"unclassified\\"\\n  }\\n]\\n"'
      );
      expect(ctx.stderr).to.equal('');
      done();
    });

  test
    .stderr()
    .stdout()
    .command([
      'diff',
      './test/fixtures/specification_v1.yml',
      './test/fixtures/specification_v2.yml',
      '--format=json',
    ])
    .it(
      'with file paths, and getting all changes, passing flag',
      // eslint-disable-next-line sonarjs/no-identical-functions
      (ctx, done) => {
        expect(JSON.stringify(ctx.stdout)).to.equal(
          '"{\\n  \\"changes\\": [\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/channels/light~1measured/publish/message/payload/properties/id/minimum\\",\\n      \\"before\\": 0,\\n      \\"after\\": 1,\\n      \\"type\\": \\"unclassified\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/protocol\\",\\n      \\"before\\": \\"mqtt\\",\\n      \\"after\\": \\"http\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/servers/mosquitto/url\\",\\n      \\"before\\": \\"mqtt://test.mosquitto.org\\",\\n      \\"after\\": \\"http://test.mosquitto.org\\",\\n      \\"type\\": \\"breaking\\"\\n    },\\n    {\\n      \\"action\\": \\"edit\\",\\n      \\"path\\": \\"/info/title\\",\\n      \\"before\\": \\"Streetlights API\\",\\n      \\"after\\": \\"Streetlights API V2\\",\\n      \\"type\\": \\"non-breaking\\"\\n    }\\n  ]\\n}\\n"'
        );
        expect(ctx.stderr).to.equal('');
        done();
      }
    );
});
