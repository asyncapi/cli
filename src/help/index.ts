import Help from '@oclif/plugin-help';
import * as Config from '@oclif/config';
import CommandHelp from './CommandHelper';

export default class CustomHelp extends Help {
  showRootHelp() {
    let rootCommands = this.sortedCommands;
    console.log(this.formatRoot());
    console.log('');

    if (!this.opts.all) {
      rootCommands = rootCommands.filter(c => !c.id.includes(':'));
    }

    if (rootCommands.length > 0) {
      rootCommands = rootCommands.filter(c => c.id);
      console.log(this.formatCommands(rootCommands));
      console.log('');
    }
  }

  showTopicHelp(topic: Config.Topic) {
    const name = topic.name;
    const depth = name.split(':').length;

    const commands = this.sortedCommands.filter(c => c.id.startsWith(`${name}:`) && c.id.split(':').length === depth + 1);

    console.log(this.formatTopic(topic));

    if (commands.length > 0) {
      console.log(this.formatCommands(commands));
      console.log('');
    }
  }

  showCommandHelp(command: Config.Command) {
    const name = command.id;
    const depth = name.split(':').length;

    const subCommands = this.sortedCommands.filter(c => c.id.startsWith(`${name}:`) && c.id.split(':').length === depth + 1);

    const title = command.description && this.render(command.description).split('\n')[0];
    if (title) { console.log(`${title}\n`); }
    console.log(this.formatCommand(command));
    console.log('');

    if (subCommands.length > 0) {
      console.log(this.formatCommands(subCommands));
      console.log('');
    }
  }

  formatCommand(command: Config.Command): string {
    const help = new CommandHelp(command, this.config, this.opts);
    return help.generate();
  }
}

