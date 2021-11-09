import { flags} from '@oclif/command';
import Command from '../../../base';
import { loadContextFile } from '../../../models/Context';

export default class ContextList extends Command {
  static description = 'List all the stored context in the store';
  static flags = {
    help: flags.help({char: 'h'})
  }

  async run() {
    const fileContent = await loadContextFile();
    for (const [contextName, filePath] of Object.entries(fileContent.store)) {
      this.log(`${contextName}: ${filePath}`);
    }
  }
}
