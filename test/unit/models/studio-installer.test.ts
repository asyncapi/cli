import { expect } from 'chai';
import {
  decideStudioInstall,
  STUDIO_VERSION,
} from '../../../src/domains/models/studio-installer';

describe('studio-installer - decideStudioInstall', () => {
  it('pins a concrete Studio version for on-demand installs', () => {
    expect(STUDIO_VERSION).to.match(/^\d+\.\d+\.\d+$/);
  });

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
