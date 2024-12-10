import Command from '../../core/base';
import {proxyFlags} from '../../core/flags/config/proxy.flags';

export default class Proxy extends Command {
  static description = 'Add the proxy support in the CLI.';

  static flags = proxyFlags();

  async run() {
    const { flags } = await this.parse(Proxy); //NOSONAR
    // Capturing flags
    const https_proxy = flags['https_proxy'];
    const http_proxy = flags['http_proxy'];
    const no_proxy = flags['no_proxy'];

    // Setting environment variables if flags are provided
    if (http_proxy) {
      process.env.http_proxy = http_proxy;
      this.log(
        'http_proxy has been succesfully added in the CLI} ✅',
      );
    }
    if (https_proxy) {
      process.env.https_proxy = https_proxy;
      this.log(
        'https_proxy has been succesfully added in the CLI} ✅',
      );
    }

    // Removing all proxies if `--no_proxy` is provided
    if (no_proxy) {
      delete process.env.http_proxy;
      delete process.env.https_proxy;

      this.log(
        'All the proxies has been removed from the CLI } ✅',
      );
    }
  }
}
