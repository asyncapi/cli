import path from 'path';
import fs from 'fs-extra';
import { expect, test } from '@oclif/test';

const envelopeKeys = ['status', 'message', 'data', 'errors'];

function parseEnvelope(stdout: string) {
  const result = JSON.parse(stdout);
  expect(Object.keys(result)).to.have.members(envelopeKeys);
  expect(Object.keys(result)).to.have.length(4);
  return result;
}

describe('structured JSON command results', () => {
  describe('bundle', () => {
    const input = './test/integration/bundle/first-asyncapi.yaml';

    test
      .stderr()
      .stdout()
      .command(['bundle', input, '--json'])
      .it('returns a structured success result', (ctx) => {
        const result = parseEnvelope(ctx.stdout);
        expect(result.status).to.equal('success');
        expect(result.errors).to.deep.equal([]);
        expect(result.data.sources[0]).to.deep.equal({
          input,
          kind: 'file',
          resolved: path.resolve(input),
        });
        expect(result.data.format).to.equal('yaml');
        expect(result.data.document.asyncapi).to.equal('2.6.0');
        expect(ctx.stderr).to.equal('');
      });

    test
      .stderr()
      .stdout()
      .command(['bundle', input, '--output=bundle.txt', '--json'])
      .it('returns a structured mapped error', (ctx) => {
        const result = parseEnvelope(ctx.stdout);
        expect(result.status).to.equal('error');
        expect(result.data.path).to.equal(path.resolve('bundle.txt'));
        expect(result.errors).to.deep.equal([{
          code: 'FILE_EXTENSION_UNSUPPORTED',
          message: 'Bundle output must use a .json, .yaml, or .yml extension.',
        }]);
        expect(process.exitCode).to.equal(33);
        expect(ctx.stderr).to.equal('');
      });
  });

  describe('convert', () => {
    const input = './test/fixtures/specification.yml';

    test
      .stderr()
      .stdout()
      .command(['convert', input, '--json'])
      .it('returns a structured success result', (ctx) => {
        const result = parseEnvelope(ctx.stdout);
        expect(result.status).to.equal('success');
        expect(result.errors).to.deep.equal([]);
        expect(result.data.source.input).to.equal(input);
        expect(result.data.sourceVersion).to.equal('2.2.0');
        expect(result.data.targetVersion).to.equal('3.1.0');
        expect(result.data.document.asyncapi).to.equal('3.1.0');
        expect(ctx.stderr).to.equal('');
      });

    test
      .stderr()
      .stdout()
      .command([
        'convert',
        './test/fixtures/valid-specification-latest.yml',
        '--target-version=2.3.0',
        '--json',
      ])
      .it('returns a structured mapped error', (ctx) => {
        const result = parseEnvelope(ctx.stdout);
        expect(result.status).to.equal('error');
        expect(result.data).to.equal(null);
        expect(result.errors[0].code).to.equal('CONVERSION_DOWNGRADE_UNSUPPORTED');
        expect(result.errors[0].message).to.contain('cannot be converted to an older version');
        expect(process.exitCode).to.equal(14);
        expect(ctx.stderr).to.equal('');
      });
  });

  describe('format', () => {
    const input = './test/fixtures/specification.yml';

    test
      .stderr()
      .stdout()
      .command(['format', input, '--format=json', '--json'])
      .it('returns a structured success result', (ctx) => {
        const result = parseEnvelope(ctx.stdout);
        expect(result.status).to.equal('success');
        expect(result.errors).to.deep.equal([]);
        expect(result.data.source.input).to.equal(input);
        expect(result.data.sourceFormat).to.equal('yaml');
        expect(result.data.targetFormat).to.equal('json');
        expect(result.data.document.asyncapi).to.equal('2.2.0');
        expect(ctx.stderr).to.equal('');
      });

    test
      .stderr()
      .stdout()
      .command(['format', './test/fixtures/specification.json', '--format=json', '--json'])
      .it('returns a structured mapped error', (ctx) => {
        const result = parseEnvelope(ctx.stdout);
        expect(result.status).to.equal('error');
        expect(result.data).to.equal(null);
        expect(result.errors[0].code).to.equal('DOCUMENT_ALREADY_IN_TARGET_FORMAT');
        expect(result.errors[0].message).to.contain('already a JSON');
        expect(process.exitCode).to.equal(13);
        expect(ctx.stderr).to.equal('');
      });
  });

  describe('pretty', () => {
    const input = './test/fixtures/badFormatAsyncapi.json';
    const output = './test/fixtures/structured-pretty-output.json';

    test
      .stderr()
      .stdout()
      .do(() => fs.removeSync(output))
      .command(['pretty', input, '--output', output, '--json'])
      .finally(() => fs.removeSync(output))
      .it('returns a structured success result', (ctx) => {
        const result = parseEnvelope(ctx.stdout);
        expect(result.status).to.equal('success');
        expect(result.errors).to.deep.equal([]);
        expect(result.data.source.input).to.equal(input);
        expect(result.data.format).to.equal('json');
        expect(result.data.output).to.deep.equal({
          path: path.resolve(output),
          format: 'json',
          overwritten: false,
        });
        expect(fs.existsSync(output)).to.equal(true);
        expect(ctx.stderr).to.equal('');
      });

    test
      .stderr()
      .stdout()
      .command(['pretty', './test/fixtures/not-found.yml', '--json'])
      .it('returns a structured mapped error', (ctx) => {
        const result = parseEnvelope(ctx.stdout);
        expect(result.status).to.equal('error');
        expect(result.data).to.equal(null);
        expect(result.errors[0].code).to.equal('SPEC_FILE_NOT_FOUND');
        expect(result.errors[0].message).to.contain('./test/fixtures/not-found.yml');
        expect(process.exitCode).to.equal(30);
        expect(ctx.stderr).to.equal('');
      });
  });

  describe('finite validate', () => {
    test
      .stderr()
      .stdout()
      .command(['validate', './test/fixtures/valid-specification-latest.yml', '--json'])
      .it('returns a structured success result', (ctx) => {
        const result = parseEnvelope(ctx.stdout);
        expect(result.status).to.equal('success');
        expect(result.errors).to.deep.equal([]);
        expect(result.data.valid).to.equal(true);
        expect(result.data.summary).to.deep.equal({
          errors: 0,
          warnings: 0,
          info: 0,
          hints: 0,
        });
        expect(result.data.output).to.equal(null);
        expect(ctx.stderr).to.equal('');
      });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/fixtures/specification-invalid.yml', '--json'])
      .it('returns a structured mapped error', (ctx) => {
        const result = parseEnvelope(ctx.stdout);
        expect(result.status).to.equal('error');
        expect(result.data.valid).to.equal(false);
        expect(result.data.diagnostics).to.be.an('array').with.length.greaterThan(0);
        expect(result.data.summary.errors).to.be.greaterThan(0);
        expect(result.errors[0].code).to.equal('SCHEMA_VALIDATION_FAILED');
        expect(process.exitCode).to.equal(11);
        expect(ctx.stderr).to.equal('');
      });
  });
});
