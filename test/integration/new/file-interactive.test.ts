import { expect, test } from '@oclif/test';
import inquirer from 'inquirer';
import path from 'path';
import { promises as fs } from 'fs';

describe('new:file - interactive mode', () => {
  const uniqueTestFile = `test-new-file-interactive-${Date.now()}.yaml`;
  const testFilePath = path.resolve(process.cwd(), uniqueTestFile);

  after(async () => {
    try { await fs.unlink(testFilePath); } catch { /* ignore */ }
  });

  describe('interactive prompts with inquirer stub', () => {
    let originalIsTTY: boolean | undefined;

    beforeEach(() => {
      originalIsTTY = process.stdout.isTTY;
      Object.defineProperty(process.stdout, 'isTTY', { value: true, writable: true, configurable: true });
    });

    afterEach(() => {
      if (originalIsTTY === undefined) {
        delete (process.stdout as any).isTTY;
      } else {
        Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY, writable: true, configurable: true });
      }
    });

    test
      .stub(inquirer, 'prompt', (stub: any) =>
        stub.resolves({
          filename: uniqueTestFile,
          'use-example': false,
          studio: false,
        })
      )
      .stdout()
      .stderr()
      .command(['new:file'])
      .it('should create file with interactive filename prompt', (ctx) => {
        expect(ctx.stdout).to.include('successfully created');
      });
  });
});
