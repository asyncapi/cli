import { expect } from 'chai';

// The start:api and start:preview commands start long-running servers,
// which makes them difficult to test in a unit/integration context.
// We verify their existence and flag parsing through the compiled manifest.

describe('start commands', () => {
  let manifest: any;

  before(() => {
    manifest = require('../../../oclif.manifest.json');
  });

  describe('start:api', () => {
    it('should be registered in oclif manifest', () => {
      expect(manifest.commands).to.have.property('start:api');
    });

    it('should have a description', () => {
      expect(manifest.commands['start:api'].description).to.include('starts the AsyncAPI server API');
    });

    it('should accept a --port flag', () => {
      const flags = manifest.commands['start:api'].flags;
      expect(flags).to.have.property('port');
    });
  });

  describe('start:preview', () => {
    it('should be registered in oclif manifest', () => {
      expect(manifest.commands).to.have.property('start:preview');
    });

    it('should have a description', () => {
      expect(manifest.commands['start:preview'].description).to.include('starts a new local instance');
    });

    it('should require a spec-file argument', () => {
      const args = manifest.commands['start:preview'].args;
      expect(args).to.have.property('spec-file');
      expect(args['spec-file'].required).to.be.true;
    });

    it('should accept --port and --noBrowser flags', () => {
      const flags = manifest.commands['start:preview'].flags;
      expect(flags).to.have.property('port');
      expect(flags).to.have.property('noBrowser');
    });
  });

  describe('start:studio', () => {
    it('should be registered in oclif manifest', () => {
      expect(manifest.commands).to.have.property('start:studio');
    });
  });
});
