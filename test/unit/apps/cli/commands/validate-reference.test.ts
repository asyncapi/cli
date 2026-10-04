import fs from 'fs';
import os from 'os';
import path from 'path';
import { expect, test } from '@oclif/test';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-ref-'));
const specPath = path.join(tmpDir, 'bad-ref.yml');
fs.writeFileSync(
  specPath,
  [
    'asyncapi: 2.6.0',
    'info:',
    '  title: Bad ref',
    '  version: 1.0.0',
    'channels:',
    '  user/signedup:',
    '    subscribe:',
    '      message:',
    '        $ref: \'./does-not-exist.yml#/components/messages/UserSignedUp\'',
    '',
  ].join('\n'),
);

describe('validate: unresolved references', () => {
  after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  test
    .stderr()
    .stdout()
    .command(['validate', specPath, '--json'])
    .it('maps invalid-ref diagnostics to REFERENCE_RESOLUTION_FAILED', (ctx) => {
      const result = JSON.parse(ctx.stdout);
      expect(result.status).to.equal('error');
      expect(result.errors[0].code).to.equal('REFERENCE_RESOLUTION_FAILED');
      expect(process.exitCode).to.equal(12);
      expect(result.data.valid).to.equal(false);
      expect(
        result.data.diagnostics.some(
          (d: { code: string; severity: string }) => d.code === 'invalid-ref' && d.severity === 'error',
        ),
      ).to.equal(true);
    });
});
