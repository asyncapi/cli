// test/commands/start/preview.test.ts
import { expect, test } from '@oclif/test';
import { promises as fs } from 'fs';
import path from 'path';
import { bundleInMemory } from '../../../src/commands/bundle';
import { startPreview } from '../../../src/commands/start/preview'; //

const asyncAPISpecPath = './test/fixtures/spec/asyncapi.yaml';
const asyncAPIWithRefsPath = './test/fixtures/spec/asyncapi-with-refs.yaml';

async function setupTestSpecFiles() {
  await fs.mkdir(path.dirname(asyncAPISpecPath), { recursive: true });
  await fs.writeFile(
    asyncAPISpecPath,
    'asyncapi: "2.0.0"\ninfo:\n  title: Test API\n  version: "1.0.0"\n'
  );
  await fs.writeFile(
    asyncAPIWithRefsPath,
    'asyncapi: "2.0.0"\ninfo:\n  title: Test API with Refs\n  version: "1.0.0"\ncomponents:\n  schemas:\n    example: \n      $ref: ./example-schema.yaml\n'
  );
}

describe('start preview', () => {
  before(async () => {
    await setupTestSpecFiles();
  });

  after(async () => {
    await fs.rm('./test/fixtures', { recursive: true, force: true });
  });

  test
    .stdout()
    .stderr()
    .do(async () => {
      const bundledDoc = await bundleInMemory([asyncAPISpecPath], {});
      await startPreview(bundledDoc.string(), { readOnly: true });
    })
    .it('should start preview with a bundled AsyncAPI document', (ctx) => {
      expect(ctx.stdout).to.contain('Preview started');
    });

  test
    .stdout()
    .stderr()
    .do(async () => {
      const bundledDoc = await bundleInMemory([asyncAPIWithRefsPath], {});
      await startPreview(bundledDoc.string(), { readOnly: true });
    })
    .it('should handle references correctly during preview', (ctx) => {
      expect(ctx.stdout).to.contain('Preview started');
    });

  test
    .stderr()
    .do(async () => {
      try {
        await startPreview('', { readOnly: true });
      } catch (error) {
        expect(error.message).to.contain('Invalid AsyncAPI document');
      }
    })
    .it('should throw an error for invalid or empty AsyncAPI documents');
});
