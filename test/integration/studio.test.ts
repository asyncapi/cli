import { test } from '@oclif/test';
import { expect } from '@oclif/test';
import { testPreview, testStudio } from '../helpers';

describe('Test live studio', () => {
  test
    .stdout()
    .command([
      'start studio','-B','-p','3210','./test/fixtures/specification-v3.yml',
    ])
    .it('should successfully open and navigate the site', async () => {
      const {logoTitle,sideBarId,navigationPannelId,editorId} = await testStudio();
      expect(logoTitle).to.equal('AsyncAPI Logo');
      expect(sideBarId).to.equal('sidebar');
      expect(navigationPannelId).to.equal('navigation-panel');
      expect(editorId).to.equal('editor');
    });
});

describe('Test preview mode', () => {
  test
    .stdout()
    .command([
      'start preview','-B','-p','4321','./test/fixtures/asyncapi_v2.yml',
    ])
    .it('should successfully open and navigate the site', async () => {
      const {logoTitle,introductionSectionId} = await testPreview();
      expect(logoTitle).to.equal('AsyncAPI Logo');
      expect(introductionSectionId).to.equal('introduction');
    });
});
