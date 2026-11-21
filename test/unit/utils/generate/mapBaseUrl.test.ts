import { expect } from 'chai';
import os from 'os';
import path from 'path';
import { getMapBaseUrlToFolderResolver } from '../../../../src/utils/generate/mapBaseUrl';
import { ApplicationError } from '../../../../src/errors/application-error';

describe('getMapBaseUrlToFolderResolver()', () => {
  const folder = path.join(os.tmpdir(), 'asyncapi-map-base-url-missing');
  const resolver = getMapBaseUrlToFolderResolver({ url: 'https://example.com/schemas', folder });

  it('rejects with GENERATED_REFERENCE_READ_FAILED when the mapped file cannot be read', async () => {
    try {
      await resolver.read({ url: 'https://example.com/schemas/missing.json' });
      expect.fail('should have rejected');
    } catch (e: any) {
      expect(e).to.be.instanceOf(ApplicationError);
      expect(e.code).to.equal('GENERATED_REFERENCE_READ_FAILED');
      expect(e.exitCode).to.equal(27);
      expect(e.message).to.equal(`Error opening file "${folder}/missing.json"`);
      expect(e.cause.code).to.equal('ENOENT');
    }
  });

  it('resolves file contents when the mapped file exists', async () => {
    const localResolver = getMapBaseUrlToFolderResolver({
      url: 'https://example.com/fixtures',
      folder: path.resolve('test/fixtures'),
    });
    const data = await localResolver.read({ url: 'https://example.com/fixtures/specification.yml' });
    expect(String(data)).to.include('asyncapi');
  });
});
