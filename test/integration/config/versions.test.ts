import { expect } from 'chai';
import { runCommand } from '@oclif/test';

describe('config', () => {
  describe('config:versions', () => {
    it('should show versions of AsyncAPI tools used', async () => {
      const { stdout, stderr } = await runCommand(['config:versions']);
      expect(stdout).to.contain('@asyncapi/cli/');
      expect(stdout).to.contain('├@asyncapi/');
      expect(stdout).to.contain('└@asyncapi/');
      expect(stderr).to.equal('');
    });

    it('should show address of repository of AsyncAPI CLI', async () => {
      const { stdout, stderr } = await runCommand(['config:versions']);
      expect(stdout).to.contain('https://github.com/asyncapi/cli');
      expect(stderr).to.equal('');
    });
  });
});
