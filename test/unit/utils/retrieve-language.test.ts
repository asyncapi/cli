import { expect } from 'chai';
import { retrieveLangauge } from '../../../src/utils/retrieve-language';

describe('retrieveLangauge()', () => {
  it('should check that content is yaml', () => {
    const result = retrieveLangauge('asyncapi: 2.2.0\nfoobar: barfoo\n');
    expect(result).to.equal('yaml');
  });

  it('should check that content is json', () => {
    const result = retrieveLangauge('{"asyncapi": "2.2.0", "foobar": "barfoo"}');
    expect(result).to.equal('json');
  });

  it('should check that content is yaml - fallback for non json content', () => {
    const result = retrieveLangauge('');
    expect(result).to.equal('yaml');
  });
});
