import { expect } from 'chai';
import type { Config } from '@oclif/core';
import {
  decideStudioInstall,
  getStudioVersionSpec,
} from '../../../src/domains/models/studio-installer';

describe('studio-installer - getStudioVersionSpec', () => {
  it('reads the Studio version range from devDependencies', () => {
    const config = {
      pjson: { devDependencies: { '@asyncapi/studio': '^1.2.0' } },
    } as unknown as Config;
    expect(getStudioVersionSpec(config)).to.equal('^1.2.0');
  });

  it('falls back to dependencies when not in devDependencies', () => {
    const config = {
      pjson: { dependencies: { '@asyncapi/studio': '1.3.0' } },
    } as unknown as Config;
    expect(getStudioVersionSpec(config)).to.equal('1.3.0');
  });

  it('falls back to "latest" when Studio is not declared', () => {
    const config = { pjson: {} } as unknown as Config;
    expect(getStudioVersionSpec(config)).to.equal('latest');
  });
});

describe('studio-installer - decideStudioInstall', () => {
  describe('auto-accept (install without prompting)', () => {
    it('installs when --yes is passed, even without a TTY', () => {
      const decision = decideStudioInstall({
        yes: true,
        isTTY: false,
        envAutoInstall: false,
      });
      expect(decision).to.equal('install');
    });

    it('installs when ASYNCAPI_STUDIO_AUTO_INSTALL=1, even without a TTY', () => {
      const decision = decideStudioInstall({
        isTTY: false,
        envAutoInstall: true,
      });
      expect(decision).to.equal('install');
    });

    it('auto-accept wins over --no-interactive', () => {
      const decision = decideStudioInstall({
        yes: true,
        noInteractive: true,
        isTTY: false,
        envAutoInstall: false,
      });
      expect(decision).to.equal('install');
    });
  });

  describe('interactive prompt', () => {
    it('prompts on a TTY when not auto-accepted', () => {
      const decision = decideStudioInstall({
        isTTY: true,
        envAutoInstall: false,
      });
      expect(decision).to.equal('prompt');
    });
  });

  describe('decline (never hangs in non-interactive contexts)', () => {
    it('declines when there is no TTY and no auto-accept', () => {
      const decision = decideStudioInstall({
        isTTY: false,
        envAutoInstall: false,
      });
      expect(decision).to.equal('decline');
    });

    it('declines when --no-interactive is set, even on a TTY', () => {
      const decision = decideStudioInstall({
        noInteractive: true,
        isTTY: true,
        envAutoInstall: false,
      });
      expect(decision).to.equal('decline');
    });
  });
});
