import Command from '../../core/base';
import {proxyFlags} from '../../core/flags/config/proxy.flags';

export default class Proxy extends Command {
  static description = 'Add the proxy support in the CLI.';

  static flags = proxyFlags();

  async run() {
    const { args, flags } = await this.parse(Proxy); //NOSONAR
    console.log(args);
    console.log(flags);
  }
}
