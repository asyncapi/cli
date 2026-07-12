import { expect } from 'chai';
import sinon from 'sinon';
import { promises as fs } from 'fs';
import { ConfigService } from '../../../src/domains/services/config.service';

describe('ConfigService', () => {
  let readFileStub: sinon.SinonStub;
  let writeFileStub: sinon.SinonStub;
  let mkdirStub: sinon.SinonStub;
  let warnStub: sinon.SinonStub;

  beforeEach(() => {
    readFileStub = sinon.stub(fs, 'readFile');
    writeFileStub = sinon.stub(fs, 'writeFile').resolves();
    mkdirStub = sinon.stub(fs, 'mkdir').resolves(undefined);
    warnStub = sinon.stub(console, 'warn');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('loadConfig()', () => {
    it('should return parsed config when file exists', async () => {
      const config = { auth: [{ pattern: '*.example.com', token: 'abc' }] };
      readFileStub.resolves(JSON.stringify(config));

      const result = await ConfigService.loadConfig();
      expect(result).to.deep.equal(config);
    });

    it('should return empty object when file does not exist (ENOENT)', async () => {
      const err: any = new Error('not found');
      err.code = 'ENOENT';
      readFileStub.rejects(err);

      const result = await ConfigService.loadConfig();
      expect(result).to.deep.equal({});
    });

    it('should throw error for non-ENOENT errors', async () => {
      const err: any = new Error('permission denied');
      err.code = 'EACCES';
      readFileStub.rejects(err);

      try {
        await ConfigService.loadConfig();
        expect.fail('should have thrown');
      } catch (e: any) {
        expect(e.message).to.include('Error reading config file');
        expect(e.message).to.include('permission denied');
      }
    });
  });

  describe('saveConfig()', () => {
    it('should create directory and write config file', async () => {
      const config = { auth: [{ pattern: '*.github.com', token: 'tok' }] };

      await ConfigService.saveConfig(config);

      expect(mkdirStub.calledOnce).to.equal(true);
      expect(mkdirStub.firstCall.args[1]).to.deep.equal({ recursive: true });
      expect(writeFileStub.calledOnce).to.equal(true);
      const writtenContent = writeFileStub.firstCall.args[1];
      expect(JSON.parse(writtenContent)).to.deep.equal(config);
    });
  });

  describe('addAuthEntry()', () => {
    it('should add entry to existing auth array', async () => {
      const existingConfig = { auth: [{ pattern: 'old', token: 'tok1' }] };
      readFileStub.resolves(JSON.stringify(existingConfig));

      const newEntry = { pattern: 'new', token: 'tok2' };
      await ConfigService.addAuthEntry(newEntry);

      expect(writeFileStub.calledOnce).to.equal(true);
      const savedConfig = JSON.parse(writeFileStub.firstCall.args[1]);
      expect(savedConfig.auth).to.have.lengthOf(2);
      expect(savedConfig.auth[1]).to.deep.equal(newEntry);
    });

    it('should create auth array when none exists', async () => {
      readFileStub.resolves(JSON.stringify({}));

      const entry = { pattern: 'example.com/**', token: 'secret' };
      await ConfigService.addAuthEntry(entry);

      const savedConfig = JSON.parse(writeFileStub.firstCall.args[1]);
      expect(savedConfig.auth).to.have.lengthOf(1);
      expect(savedConfig.auth[0]).to.deep.equal(entry);
    });

    it('should create auth array when config file does not exist', async () => {
      const err: any = new Error('not found');
      err.code = 'ENOENT';
      readFileStub.rejects(err);

      const entry = { pattern: 'github.com/**', token: 'ghp_xxx' };
      await ConfigService.addAuthEntry(entry);

      const savedConfig = JSON.parse(writeFileStub.firstCall.args[1]);
      expect(savedConfig.auth).to.have.lengthOf(1);
    });
  });

  describe('getAuthForUrl()', () => {
    it('should return null when no auth array exists', async () => {
      readFileStub.resolves(JSON.stringify({}));

      const result = await ConfigService.getAuthForUrl('https://example.com/spec.yaml');
      expect(result).to.equal(null);
      expect(warnStub.called).to.equal(true);
    });

    it('should return null when auth is not an array', async () => {
      readFileStub.resolves(JSON.stringify({ auth: 'invalid' }));

      const result = await ConfigService.getAuthForUrl('https://example.com/spec.yaml');
      expect(result).to.equal(null);
    });

    it('should return matching auth entry for URL', async () => {
      const config = {
        auth: [
          { pattern: 'https://github.com/**', token: 'ghp_token', authType: 'token' },
        ],
      };
      readFileStub.resolves(JSON.stringify(config));

      const result = await ConfigService.getAuthForUrl('https://github.com/org/repo/file.yaml');
      expect(result).to.not.equal(null);
      expect(result!.token).to.equal('ghp_token');
      expect(result!.authType).to.equal('token');
    });

    it('should return null when no pattern matches', async () => {
      const config = {
        auth: [{ pattern: 'https://private.com/**', token: 'tok' }],
      };
      readFileStub.resolves(JSON.stringify(config));

      const result = await ConfigService.getAuthForUrl('https://public.com/spec.yaml');
      expect(result).to.equal(null);
    });

    it('should use Bearer as default authType', async () => {
      const config = {
        auth: [{ pattern: 'https://api.example.com/*', token: 'tok' }],
      };
      readFileStub.resolves(JSON.stringify(config));

      const result = await ConfigService.getAuthForUrl('https://api.example.com/spec.yaml');
      expect(result!.authType).to.equal('Bearer');
    });

    it('should return empty headers when none configured', async () => {
      const config = {
        auth: [{ pattern: 'https://api.example.com/*', token: 'tok' }],
      };
      readFileStub.resolves(JSON.stringify(config));

      const result = await ConfigService.getAuthForUrl('https://api.example.com/spec.yaml');
      expect(result!.headers).to.deep.equal({});
    });

    it('should return configured headers', async () => {
      const config = {
        auth: [
          {
            pattern: 'https://api.example.com/**',
            token: 'tok',
            headers: { 'X-Custom': 'value' },
          },
        ],
      };
      readFileStub.resolves(JSON.stringify(config));

      const result = await ConfigService.getAuthForUrl('https://api.example.com/v1/spec.yaml');
      expect(result!.headers).to.deep.equal({ 'X-Custom': 'value' });
    });

    it('should match wildcard * against URL prefix (anchored at start)', async () => {
      const config = {
        auth: [{ pattern: 'https://github.com/org/*', token: 'tok' }],
      };
      readFileStub.resolves(JSON.stringify(config));

      // * becomes [^/]* in regex, but regex.test() only checks if pattern matches from start
      // so it will match any URL starting with the prefix
      const result1 = await ConfigService.getAuthForUrl('https://github.com/org/repo');
      expect(result1).to.not.equal(null);

      // Also matches because test() finds a match from position 0
      const result2 = await ConfigService.getAuthForUrl('https://github.com/org/repo/file.yaml');
      expect(result2).to.not.equal(null);
    });

    it('should NOT match when URL does not start with pattern', async () => {
      const config = {
        auth: [{ pattern: 'https://github.com/org/*', token: 'tok' }],
      };
      readFileStub.resolves(JSON.stringify(config));

      const result = await ConfigService.getAuthForUrl('https://gitlab.com/org/repo');
      expect(result).to.equal(null);
    });

    it('should match ** for multiple path segments', async () => {
      const config = {
        auth: [{ pattern: 'https://github.com/**', token: 'tok' }],
      };
      readFileStub.resolves(JSON.stringify(config));

      const result = await ConfigService.getAuthForUrl('https://github.com/org/repo/deep/nested/file.yaml');
      expect(result).to.not.equal(null);
    });
  });
});
