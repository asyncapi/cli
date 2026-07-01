import { Args, Flags } from '@oclif/core';
import Command from '@cli/internal/base';
import { load } from '@models/SpecificationFile';
import { RegistryService } from '@services/registry.service';
import { applyProxyToPath } from '@utils/proxy';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import { promises as fs } from 'fs';
import path from 'path';

export default class Sync extends Command {
  static description = 'sync local AsyncAPI file with remote registry (push or pull)';

  static flags = {
    endpoint: Flags.string({ description: 'Remote registry endpoint or document URL' }),
    direction: Flags.string({ description: 'sync direction: push or pull', options: ['push', 'pull'], default: 'push' }),
    out: Flags.string({ description: 'Output file when pulling' }),
    ...proxyFlags(),
  };

  static args = {
    'spec-file': Args.string({ description: 'Local spec path (for push) or target file (for pull)', required: true }),
  };

  async run() {
    const { args, flags } = await this.parse(Sync);
    const registry = new RegistryService();
    const endpoint = flags.endpoint;
    const direction = flags.direction as 'push' | 'pull';

    if (direction === 'push') {
      const filePath = applyProxyToPath(args['spec-file'], flags['proxyHost'], flags['proxyPort']);
      this.specFile = await load(filePath);
      const { success, error } = await registry.publish(this.specFile, endpoint || filePath || '', { endpoint: endpoint || undefined });
      if (!success) this.error(error || 'Push failed', { exit: 1 });
      this.log('Push succeeded');
      return;
    }

    // pull
    if (!endpoint) {
      this.error('Endpoint required for pull', { exit: 1 });
    }

    const pullRes = await registry.pull(endpoint as string);
    if (!pullRes.success) this.error(pullRes.error || 'Pull failed', { exit: 1 });

    const outPath = flags.out || args['spec-file'];
    await fs.writeFile(path.resolve(outPath), pullRes.content || '', 'utf8');
    this.log(`Pulled content saved to ${outPath}`);
  }
}
