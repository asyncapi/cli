import path from 'path';
import { expect } from 'chai';
import { start as startStudio } from '../../src/domains/models/Studio';
import { startPreview } from '../../src/domains/models/Preview';
import {
  isChromeAvailable,
  testPreview,
  testStudio,
  waitForServer,
} from '../helpers/index';

function isStudioInstalled(): boolean {
  try {
    const studioPath = path.dirname(
      require.resolve('@asyncapi/studio/package.json'),
    );
    require.resolve('next', { paths: [studioPath] });
    return true;
  } catch {
    return false;
  }
}

describe('Test live studio', function () {
  this.timeout(120000);

  const port = 3210;

  before(async function () {
    if (!isStudioInstalled() || !(await isChromeAvailable())) {
      this.skip();
    }

    startStudio('./test/fixtures/specification-v3.yml', port, true);
    await waitForServer(port);
  });

  it('should successfully open and navigate the site', async () => {
    const { logoTitle } = await testStudio(port);
    expect(logoTitle).to.equal('AsyncAPI Logo');
  });
});

describe('Test preview mode', function () {
  this.timeout(120000);

  const port = 4321;

  before(async function () {
    if (!isStudioInstalled() || !(await isChromeAvailable())) {
      this.skip();
    }

    startPreview('./test/fixtures/asyncapi_v2.yml', {
      port,
      noBrowser: true,
    });
    await waitForServer(port);
  });

  it('should successfully open and navigate the site', async () => {
    const { logoTitle, introductionSectionId } = await testPreview(port);
    expect(logoTitle).to.equal('AsyncAPI Logo');
    expect(introductionSectionId).to.equal('introduction');
  });
});
