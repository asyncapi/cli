import { Flags } from '@oclif/core';
import Command from '../../base';

export default class Versions extends Command {
  static description = 'Show versions of AsyncAPI tools used';

  static flags = {
    help: Flags.help({ char: 'h' }),
  };

  private dependencies: string[] = [];
  private dependency = '';

  async run() {
    // Preparation of the array with all dependencies '@asyncapi/*' along with
    // their versions.
    for (const key in this.config.pjson.dependencies) {
      // Making sure with .indexOf() that only package names which START with
      // string '@asyncapi' are considered.
      if (key.indexOf('@asyncapi', 0) === 0) {
        // Avoiding obvious crash on manual removal or alteration of an
        // '@asyncapi' package.
        try {
          // Goofy name `importedPJSON` is chosen to distinguish from name `pjson`
          // used in `@oclif` source code.
          const importedPJSON = await import(`${key}/package.json`);
          this.dependencies.push(`${key}/${importedPJSON.default.version}`);
        } catch (e) {
          this.dependencies.push(`${key}/` + '`package.json` not found');
        }
      }
    }

    // Showing information available with `--version` flag.
    this.log(this.config.userAgent);

    // Iteration through the array containing all dependencies '@asyncapi/*'
    // along with their versions.
    for (let i = 0; i < this.dependencies.length; i++) {
      // Minimization of the theoretical possibility of a Generic Object
      // Injection Sink, at the same time disabling eslint parsing for this
      // line since it is actually a false positive.
      // https://github.com/eslint-community/eslint-plugin-security/issues/21#issuecomment-530184612
      // https://github.com/eslint-community/eslint-plugin-security/issues/21#issuecomment-1157887653
      // https://web.archive.org/web/20150430062816/https://blog.liftsecurity.io/2015/01/15/the-dangers-of-square-bracket-notation
      this.dependency = this.dependencies[i]; // eslint-disable-line
      if (i !== this.dependencies.length - 1) {
        this.log(`  ├${this.dependency}`);
      } else {
        this.log(`  └${this.dependency}\n`);
      }
    }

    this.log(`Repository: ${this.config.pjson.homepage}`);
  }
}
