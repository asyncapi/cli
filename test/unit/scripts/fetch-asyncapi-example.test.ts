import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import os from 'os';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { shouldSkipFetching } = require('../../../scripts/fetch-asyncapi-example');

describe('fetch-asyncapi-example script', () => {
  let tempDir: string;
  let examplesJsonPath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'asyncapi-examples-test-'));
    examplesJsonPath = path.join(tempDir, 'examples.json');
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should return false if examples.json does not exist', () => {
    const shouldSkip = shouldSkipFetching({
      exampleDirectory: tempDir,
      examplesJsonPath,
      force: false,
    });
    expect(shouldSkip).to.equal(false);
  });

  it('should return false if examples.json is empty or invalid JSON', () => {
    fs.writeFileSync(examplesJsonPath, '');
    let shouldSkip = shouldSkipFetching({
      exampleDirectory: tempDir,
      examplesJsonPath,
      force: false,
    });
    expect(shouldSkip).to.equal(false);

    fs.writeFileSync(examplesJsonPath, 'invalid json');
    shouldSkip = shouldSkipFetching({
      exampleDirectory: tempDir,
      examplesJsonPath,
      force: false,
    });
    expect(shouldSkip).to.equal(false);
  });

  it('should return false if examples.json is an empty array', () => {
    fs.writeFileSync(examplesJsonPath, JSON.stringify([]));
    const shouldSkip = shouldSkipFetching({
      exampleDirectory: tempDir,
      examplesJsonPath,
      force: false,
    });
    expect(shouldSkip).to.equal(false);
  });

  it('should return false if examples.json exists but no YAML spec files exist in directory', () => {
    fs.writeFileSync(examplesJsonPath, JSON.stringify([{ name: 'test', value: 'test.yml' }]));
    const shouldSkip = shouldSkipFetching({
      exampleDirectory: tempDir,
      examplesJsonPath,
      force: false,
    });
    expect(shouldSkip).to.equal(false);
  });

  it('should return true if examples.json exists with entries and YAML spec files are present', () => {
    fs.writeFileSync(examplesJsonPath, JSON.stringify([{ name: 'test', value: 'test.yml' }]));
    fs.writeFileSync(path.join(tempDir, 'test.yml'), 'asyncapi: 2.6.0');

    const shouldSkip = shouldSkipFetching({
      exampleDirectory: tempDir,
      examplesJsonPath,
      force: false,
    });
    expect(shouldSkip).to.equal(true);
  });

  it('should return false when force is true even if cached files exist', () => {
    fs.writeFileSync(examplesJsonPath, JSON.stringify([{ name: 'test', value: 'test.yml' }]));
    fs.writeFileSync(path.join(tempDir, 'test.yml'), 'asyncapi: 2.6.0');

    const shouldSkip = shouldSkipFetching({
      exampleDirectory: tempDir,
      examplesJsonPath,
      force: true,
    });
    expect(shouldSkip).to.equal(false);
  });
});
