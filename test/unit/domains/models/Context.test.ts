import { expect } from 'chai';
import { promises as fs, existsSync, writeFileSync, unlinkSync } from 'fs';
import * as path from 'path';
import os from 'os';

import {
  isContextFileEmpty,
  IContextFile,
} from '../../../../src/domains/models/Context';

// Test the pure helper function isContextFileEmpty which has no side effects.
// The other functions (loadContext, addContext, etc.) are covered via integration
// tests in test/integration/context.test.ts.  This file specifically targets the
// uncovered branches of the utility helpers identified in issue #2016.

describe('Context model - unit tests for isContextFileEmpty()', () => {
  it('should return true when store is empty and no current field', async () => {
    const emptyContent: IContextFile = { store: {} };
    const result = await isContextFileEmpty(emptyContent);
    expect(result).to.equal(true);
  });

  it('should return false when store has at least one entry', async () => {
    const nonEmptyContent: IContextFile = {
      store: { home: '/path/to/asyncapi.yml' },
    };
    const result = await isContextFileEmpty(nonEmptyContent);
    expect(result).to.equal(false);
  });

  it('should return false when current is set and store has entries', async () => {
    const contentWithCurrent: IContextFile = {
      current: 'home',
      store: { home: '/path/to/asyncapi.yml' },
    };
    const result = await isContextFileEmpty(contentWithCurrent);
    expect(result).to.equal(false);
  });

  it('should return false when current is set even if store is empty (two keys)', async () => {
    // When current is set, Object.keys has length 2 so the condition fails
    const contentWithCurrentOnly = {
      current: 'home',
      store: {},
    } as IContextFile;
    const result = await isContextFileEmpty(contentWithCurrentOnly);
    expect(result).to.equal(false);
  });
});

describe('Context model - IContextFile interface shape', () => {
  it('should accept a context file object with only store', () => {
    const content: IContextFile = { store: {} };
    expect(content).to.have.property('store');
    expect(content.current).to.equal(undefined);
  });

  it('should accept a context file object with current and store', () => {
    const content: IContextFile = {
      current: 'home',
      store: { home: '/path/to/asyncapi.yml' },
    };
    expect(content.current).to.equal('home');
    expect(content.store['home']).to.equal('/path/to/asyncapi.yml');
  });

  it('should support multiple store entries', () => {
    const content: IContextFile = {
      current: 'home',
      store: {
        home: '/home/user/asyncapi.yml',
        work: '/work/project/asyncapi.yml',
        ci: 'https://raw.githubusercontent.com/asyncapi/spec/master/examples/streetlights.yml',
      },
    };
    expect(Object.keys(content.store).length).to.equal(3);
  });
});
