import { Args, Flags } from '@oclif/core';
import Command from '@cli/internal/base';
import { load } from '@models/SpecificationFile';
import { RegistryService } from '@services/registry.service';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import { applyProxyToPath } from '@utils/proxy';

export default class Publish extends Command {
  static description = 'publish AsyncAPI file to a schema registry or endpoint';

  static flags = {
    endpoint: Flags.string({ description: 'Full registry endpoint URL to publish to' }),
    'content-type': Flags.string({ description: 'Content-Type for the published document', default: 'application/yaml' }),
    ...proxyFlags(),
  };

  static args = {
    'spec-file': Args.string({ description: 'Spec path or url', required: true }),
  };

  async run() {
    const { args, flags } = await this.parse(Publish);
    const filePath = applyProxyToPath(args['spec-file'], flags['proxyHost'], flags['proxyPort']);
    this.specFile = await load(filePath);

    const registry = new RegistryService();
    const endpoint = flags.endpoint || '';

    const { success, location, error } = await registry.publish(this.specFile, endpoint || filePath || '', {
      endpoint: endpoint || undefined,
      contentType: flags['content-type'],
    });

    if (!success) {
      this.error(error || 'Publish failed', { exit: 1 });
    }

    this.log(`Published successfully${location ? ` at ${location}` : ''}`);
  }
}
