import { Args, Flags } from '@oclif/core';
import Command from '@cli/internal/base';
import { load } from '@models/SpecificationFile';
import { RegistryService } from '@services/registry.service';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import { applyProxyToPath } from '@utils/proxy';

export default class Share extends Command {
  static description = 'share AsyncAPI file (convenience wrapper around publish)';

  static flags = {
    endpoint: Flags.string({ description: 'Share endpoint URL' }),
    ...proxyFlags(),
  };

  static args = {
    'spec-file': Args.string({ description: 'Spec path or url', required: true }),
  };

  async run() {
    const { args, flags } = await this.parse(Share);
    const filePath = applyProxyToPath(args['spec-file'], flags['proxyHost'], flags['proxyPort']);
    this.specFile = await load(filePath);

    const registry = new RegistryService();
    const endpoint = flags.endpoint || '';

    const { success, location, error } = await registry.publish(this.specFile, endpoint || filePath || '', {
      endpoint: endpoint || undefined,
      contentType: 'application/yaml',
    });

    if (!success) {
      this.error(error || 'Share failed', { exit: 1 });
    }

    this.log(`Shared successfully${location ? ` at ${location}` : ''}`);
  }
}
