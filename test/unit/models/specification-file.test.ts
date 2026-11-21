import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Specification } from '../../../src/domains/models/SpecificationFile';
import { ApplicationError } from '../../../src/errors/application-error';
import { ErrorLoadingSpec } from '../../../src/errors/specification-file';
import { logger } from '../../../src/utils/logger';

const URL_NAME = 'error loading AsyncAPI document from url';
const FILE_NAME = 'error loading AsyncAPI document from file';
const TARGET = 'http://localhost:1/spec.yml';

async function captureError(fn: () => Promise<unknown>): Promise<any> {
  try {
    await fn();
  } catch (e) {
    return e;
  }
  expect.fail('should have thrown');
}

describe('Specification loading errors', () => {
  afterEach(() => sinon.restore());

  describe('fromFile()', () => {
    let tmpDir: string;
    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-file-test-'));
    });
    afterEach(() => {
      fs.chmodSync(tmpDir, 0o700);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('keeps the ErrorLoadingSpec error for missing files', async () => {
      const missing = path.join(tmpDir, 'missing.yml');
      const err = await captureError(() => Specification.fromFile(missing));
      expect(err).to.be.instanceOf(ErrorLoadingSpec);
      expect(err.name).to.equal(FILE_NAME);
      expect(err.message).to.equal(`${missing} file does not exist.`);
    });

    it('reports FILE_READ_FAILED when the path is a directory', async () => {
      const err = await captureError(() => Specification.fromFile(tmpDir));
      expect(err).to.be.instanceOf(ApplicationError);
      expect(err.code).to.equal('FILE_READ_FAILED');
      expect(err.exitCode).to.equal(34);
      expect(err.name).to.equal(FILE_NAME);
      expect(err.message).to.equal(`${tmpDir} is a directory, not a file.`);
      expect(err.cause.code).to.equal('EISDIR');
    });

    it('reports FILE_PERMISSION_DENIED for unreadable files', async function (this: Mocha.Context) {
      if (process.platform === 'win32' || process.getuid?.() === 0) {
        this.skip();
      }
      const file = path.join(tmpDir, 'locked.yml');
      fs.writeFileSync(file, 'asyncapi: 2.6.0');
      fs.chmodSync(file, 0o000);
      const err = await captureError(() => Specification.fromFile(file));
      expect(err).to.be.instanceOf(ApplicationError);
      expect(err.code).to.equal('FILE_PERMISSION_DENIED');
      expect(err.exitCode).to.equal(31);
      expect(err.name).to.equal(FILE_NAME);
      expect(err.message).to.include('permission denied');
    });
  });

  describe('fromURL()', () => {
    let fetchStub: sinon.SinonStub;
    beforeEach(() => {
      fetchStub = sinon.stub(globalThis, 'fetch');
      sinon.stub(logger, 'error');
    });

    function expectUrlError(err: any, code: string, exitCode: number, url = TARGET) {
      expect(err).to.be.instanceOf(ApplicationError);
      expect(err.code).to.equal(code);
      expect(err.exitCode).to.equal(exitCode);
      expect(err.name).to.equal(URL_NAME);
      expect(err.message).to.equal(`Failed to download ${url}.`);
    }

    it('returns the specification on success', async () => {
      fetchStub.resolves(new Response('asyncapi: 2.6.0', { status: 200 }));
      const spec = await Specification.fromURL(TARGET);
      expect(spec.text()).to.equal('asyncapi: 2.6.0');
      expect(spec.getFileURL()).to.equal(TARGET);
    });

    it('reports HTTP_RESPONSE_ERROR for non-ok responses', async () => {
      fetchStub.resolves(new Response('nope', { status: 404, statusText: 'Not Found' }));
      const err = await captureError(() => Specification.fromURL(TARGET));
      expectUrlError(err, 'HTTP_RESPONSE_ERROR', 43);
      expect(err.details).to.deep.equal({ url: TARGET, status: 404, statusText: 'Not Found' });
    });

    it('reports CONNECTION_FAILED for DNS failures and keeps the cause', async () => {
      const cause = Object.assign(new Error('getaddrinfo ENOTFOUND'), { code: 'ENOTFOUND' });
      const fetchError = new TypeError('fetch failed', { cause });
      fetchStub.rejects(fetchError);
      const err = await captureError(() => Specification.fromURL(TARGET));
      expectUrlError(err, 'CONNECTION_FAILED', 40);
      expect(err.cause).to.equal(fetchError);
    });

    it('reports CONNECTION_FAILED for aggregated ECONNREFUSED errors', async () => {
      const refused = Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' });
      fetchStub.rejects(new TypeError('fetch failed', { cause: new AggregateError([refused]) }));
      const err = await captureError(() => Specification.fromURL(TARGET));
      expectUrlError(err, 'CONNECTION_FAILED', 40);
    });

    it('reports CONNECTION_FAILED for a bare "fetch failed" TypeError', async () => {
      fetchStub.rejects(new TypeError('fetch failed'));
      const err = await captureError(() => Specification.fromURL(TARGET));
      expectUrlError(err, 'CONNECTION_FAILED', 40);
    });

    it('reports NETWORK_TIMEOUT for timeouts', async () => {
      const cause = Object.assign(new Error('Connect Timeout Error'), { code: 'UND_ERR_CONNECT_TIMEOUT' });
      fetchStub.rejects(new TypeError('fetch failed', { cause }));
      const err = await captureError(() => Specification.fromURL(TARGET));
      expectUrlError(err, 'NETWORK_TIMEOUT', 41);
    });

    it('reports NETWORK_TIMEOUT for aborted requests', async () => {
      fetchStub.rejects(new DOMException('The operation was aborted due to timeout', 'TimeoutError'));
      const err = await captureError(() => Specification.fromURL(TARGET));
      expectUrlError(err, 'NETWORK_TIMEOUT', 41);
    });

    it('reports URL_FETCH_FAILED for invalid URLs without fetching', async () => {
      const err = await captureError(() => Specification.fromURL('not a url'));
      expectUrlError(err, 'URL_FETCH_FAILED', 40, 'not a url');
      expect(err.cause.code).to.equal('ERR_INVALID_URL');
      expect(fetchStub.called).to.equal(false);
    });

    it('reports PROXY_ERROR when the proxy cannot be used', async () => {
      const err = await captureError(() => Specification.fromURL(`${TARGET}+not-a-proxy-url`));
      expectUrlError(err, 'PROXY_ERROR', 42);
      expect(err.cause.message).to.include('Proxy Connection Error');
      expect(fetchStub.called).to.equal(false);
    });

    it('reports PROXY_ERROR when fetching through the proxy fails', async () => {
      fetchStub.rejects(new TypeError('fetch failed'));
      const err = await captureError(() => Specification.fromURL(`${TARGET}+http://localhost:2`));
      expectUrlError(err, 'PROXY_ERROR', 42);
    });
  });
});
