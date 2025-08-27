import { expect } from 'chai';
import { getAppOpenAPI } from '../../../src/utils/app-openapi';

describe('getAppOpenAPI()', () => {
  it('should return OpenAPI document as JSON', async () => {
    const openapi = await getAppOpenAPI();
    expect(openapi.openapi).to.equal('3.1.0');
    expect(openapi.info.title).to.equal('AsyncAPI Server API');
  });

  it('should return always this same instance of JSON', async () => {
    const openapi1 = await getAppOpenAPI();
    const openapi2 = await getAppOpenAPI();
    // assert references
    expect(openapi1 === openapi2).to.equal(true);
  });
});
