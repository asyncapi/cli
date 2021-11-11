/* eslint-disable sonarjs/no-duplicate-string */
import { expect, test } from '@oclif/test';

describe('diff', () => {
  describe('with file paths, and there are no difference between the files', () => {
    test
      .stderr()
      .stdout()
      .command(['diff', './test/specification.yml', './test/specification.yml'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).to.equal('{"changes":[]}\n');
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
        '--type=all'
      ])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).to.equal(
          '{"changes":[{"action":"edit","path":"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum","before":0,"after":1,"type":"unclassified"},{"action":"edit","path":"/channels/light~1measured/publish/message/payload/properties/id/minimum","before":0,"after":1,"type":"unclassified"},{"action":"edit","path":"/servers/mosquitto/protocol","before":"mqtt","after":"http","type":"breaking"},{"action":"edit","path":"/servers/mosquitto/url","before":"mqtt://test.mosquitto.org","after":"http://test.mosquitto.org","type":"breaking"},{"action":"edit","path":"/info/title","before":"Streetlights API","after":"Streetlights API V2","type":"non-breaking"}]}\n'
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
        expect(ctx.stdout).to.equal(
          '[{"action":"edit","path":"/servers/mosquitto/protocol","before":"mqtt","after":"http","type":"breaking"},{"action":"edit","path":"/servers/mosquitto/url","before":"mqtt://test.mosquitto.org","after":"http://test.mosquitto.org","type":"breaking"}]\n'
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
        expect(ctx.stdout).to.equal(
          '[{"action":"edit","path":"/info/title","before":"Streetlights API","after":"Streetlights API V2","type":"non-breaking"}]\n'
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
        expect(ctx.stdout).to.equal(
          '[{"action":"edit","path":"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum","before":0,"after":1,"type":"unclassified"},{"action":"edit","path":"/channels/light~1measured/publish/message/payload/properties/id/minimum","before":0,"after":1,"type":"unclassified"}]\n'
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
        expect(ctx.stdout).to.equal(
          '{"changes":[{"action":"edit","path":"/channels/light~1measured/publish/message/x-parser-original-payload/properties/id/minimum","before":0,"after":1,"type":"unclassified"},{"action":"edit","path":"/channels/light~1measured/publish/message/payload/properties/id/minimum","before":0,"after":1,"type":"unclassified"},{"action":"edit","path":"/servers/mosquitto/protocol","before":"mqtt","after":"http","type":"breaking"},{"action":"edit","path":"/servers/mosquitto/url","before":"mqtt://test.mosquitto.org","after":"http://test.mosquitto.org","type":"breaking"},{"action":"edit","path":"/info/title","before":"Streetlights API","after":"Streetlights API V2","type":"non-breaking"}]}\n'
        );
        expect(ctx.stderr).to.equal('');
        done();
      });
  });
});
