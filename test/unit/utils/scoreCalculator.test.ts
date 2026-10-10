import { expect } from 'chai';
import { calculateScore } from '../../../src/utils/scoreCalculator';

describe('calculateScore()', () => {
  function createMockDocument(options: {
    hasDescription?: boolean;
    hasLicense?: boolean;
    hasServers?: boolean;
    hasChannels?: boolean;
  } = {}) {
    return {
      info: () => ({
        hasDescription: () => options.hasDescription ?? false,
        hasLicense: () => options.hasLicense ?? false,
      }),
      servers: () => ({
        isEmpty: () => !(options.hasServers ?? false),
      }),
      channels: () => ({
        isEmpty: () => !(options.hasChannels ?? false),
      }),
    } as any;
  }

  it('should return 0 for document with nothing', async () => {
    const doc = createMockDocument();
    const score = await calculateScore(doc);
    expect(score).to.equal(0);
  });

  it('should return 15 for document with description only', async () => {
    const doc = createMockDocument({ hasDescription: true });
    const score = await calculateScore(doc);
    expect(score).to.equal(15);
  });

  it('should return 25 for document with license only', async () => {
    const doc = createMockDocument({ hasLicense: true });
    const score = await calculateScore(doc);
    expect(score).to.equal(25);
  });

  it('should return 25 for document with servers only', async () => {
    const doc = createMockDocument({ hasServers: true });
    const score = await calculateScore(doc);
    expect(score).to.equal(25);
  });

  it('should return 35 for document with channels only', async () => {
    const doc = createMockDocument({ hasChannels: true });
    const score = await calculateScore(doc);
    expect(score).to.equal(35);
  });

  it('should return 100 for complete document', async () => {
    const doc = createMockDocument({
      hasDescription: true,
      hasLicense: true,
      hasServers: true,
      hasChannels: true,
    });
    const score = await calculateScore(doc);
    expect(score).to.equal(100);
  });

  it('should return 60 for undefined document (due to !undefined evaluating as true for servers/channels)', async () => {
    // Note: This is a known quirk - optional chaining with negation means
    // !document?.servers().isEmpty() === !undefined === true
    const score = await calculateScore(undefined);
    expect(score).to.equal(60);
  });

  it('should return 40 for document with description and license', async () => {
    const doc = createMockDocument({ hasDescription: true, hasLicense: true });
    const score = await calculateScore(doc);
    expect(score).to.equal(40);
  });

  it('should return 60 for document with servers and channels', async () => {
    const doc = createMockDocument({ hasServers: true, hasChannels: true });
    const score = await calculateScore(doc);
    expect(score).to.equal(60);
  });
});
