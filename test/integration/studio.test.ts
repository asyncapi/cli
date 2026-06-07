import { expect } from 'chai';
import { start as startStudio } from '../../src/domains/models/Studio';
import { startPreview } from '../../src/domains/models/Preview';
import {
  closeStudioServer,
  isChromeAvailable,
  testPreview,
  testStudio,
  waitForServer,
} from '../helpers/index';

describe('Test live studio', function () {
  this.timeout(120000);

  const port = 3210;

  before(async function () {
    if (!(await isChromeAvailable())) {
      this.skip();
    }

    startStudio('./test/fixtures/specification-v3.yml', port, true);
    await waitForServer(port);
  });

  after(async () => {
    await closeStudioServer(port);
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
    if (!(await isChromeAvailable())) {
      this.skip();
    }

    startPreview(
      './test/fixtures/asyncapi_v2.yml',
      undefined,
      undefined,
      undefined,
      undefined,
      port,
      true,
    );
    await waitForServer(port);
  });

  after(async () => {
    await closeStudioServer(port);
  });

  it('should successfully open and navigate the site', async () => {
    const { logoTitle, introductionSectionId } = await testPreview(port);
    expect(logoTitle).to.equal('AsyncAPI Logo');
    expect(introductionSectionId).to.equal('introduction');
  });
});
