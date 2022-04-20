import * as path from 'path';
import { assert } from 'chai';
import {test} from 'mocha';
import { GenerateFlagParser } from '../../src/commands/generate';

const flagParser = new GenerateFlagParser(
  ['generate:before', 'generate:after=foo,bar'],
  ['title=Hello from param'],
  'https://schema.example.com/crm/:./test/docs/'
);

describe('GeneratorFlagParser', () => {
  test('.params()', () => {
    it('should return parsed param object', () => {
      assert.deepEqual(flagParser.params(), {title: 'Hello from param'});
    });
  });

  test('.disableHooks()', () => {
    it('should return parsed disableHook object', () => {
      assert.deepEqual(flagParser.disableHooks(), {'generate:before': true, 'generate:after': ['foo', 'bar']});
    });
  });

  test('.mapBaseUrlToFolder()', () => {
    it('should return url and resolved folder path', () => {
      console.warn(flagParser.mapBaseUrlToFolder());
      assert.deepEqual(flagParser.mapBaseUrlToFolder(), {url: 'https://schema.example.com/crm/', folder: path.resolve('./test/docs/')});
    });
  });
});
