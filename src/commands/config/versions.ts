import { Flags } from '@oclif/core';
import Command from '../../base';

export default class Versions extends Command {
  static description = 'Show versions of AsyncAPI tools used';
  
  static flags = {
    help: Flags.help({ char: 'h' }),
  };

  private dependencies: string[] = [];

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
          const importedPJSON = await import(key + '/package.json');
          this.dependencies.push(key + '/' + importedPJSON.default.version);
        } catch (e) {
          this.dependencies.push(key + '/' + '`package.json` not found');
        }
      }
    }

    // Showing information available with `--version` flag.
    this.log(this.config.userAgent);

    // Iteration through the array containing all dependencies '@asyncapi/*'
    // along with their versions.
    for (let i = 0; i < this.dependencies.length; i++) {
      if (i !== this.dependencies.length - 1) {
        this.log('  ├' + this.dependencies[i]);
      } else {
        this.log('  └' + this.dependencies[i] + '\n');
      }
    }

    this.log('Repository: ' + this.config.pjson.homepage);
  }
}
