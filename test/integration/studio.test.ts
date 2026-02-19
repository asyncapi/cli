import { test } from '@oclif/test';
import { expect } from '@oclif/test';
import { testPreview, testStudio, closeStudioServer } from '../helpers/index';

describe('Test live studio', () => {
  test
    .stdout()
    .command([
      'start studio','-B','-p','3210','./test/fixtures/specification-v3.yml',
    ]).finally(async () => {
      await closeStudioServer(3210);
    })
    .it('should successfully open and navigate the site', async () => {
      const {logoTitle} = await testStudio();
      expect(logoTitle).to.equal('AsyncAPI Logo');
    });
});

describe('Test preview mode', () => {
  test
    .stdout()
    .command([
      'start preview','-B','-p','4321','./test/fixtures/asyncapi_v2.yml',
    ]).finally(async () => {
      await closeStudioServer(4321);
    })
    .it('should successfully open and navigate the site', async () => {
      const {logoTitle,introductionSectionId} = await testPreview();
      expect(logoTitle).to.equal('AsyncAPI Logo');
      expect(introductionSectionId).to.equal('introduction');
    });
});
