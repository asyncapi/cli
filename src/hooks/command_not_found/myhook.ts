import {Hook, toConfiguredId, CliUx} from '@oclif/core';
import chalk from 'chalk';
import {default as levenshtein} from 'fast-levenshtein';
import { Help } from '@oclif/core';

export const closest = (target: string, possibilities: string[]): string =>
  possibilities
    .map((id) => ({distance: levenshtein.get(target, id, {useCollator: true}), id}))
    .sort((a, b) => a.distance - b.distance)[0]?.id ?? '';

const hook: Hook.CommandNotFound = async function (opts) {
  if (opts.id === '--help') {
    const help = new Help(this.config);
    help.showHelp(['--help']);
    return;
  }
  const hiddenCommandIds = new Set(opts.config.commands.filter((c) => c.hidden).map((c) => c.id));
  const commandIDs = [...opts.config.commandIDs, ...opts.config.commands.flatMap((c) => c.aliases)].filter(
    (c) => !hiddenCommandIds.has(c),
  );

  if (commandIDs.length === 0) {return;}

  // now we we return if the command id are not there.

  let binHelp = `${opts.config.bin} help`;

  const idSplit = opts.id.split(':');
  if (opts.config.findTopic(idSplit[0])) {
    // if valid topic, update binHelp with topic
    binHelp = `${binHelp} ${idSplit[0]}`;
  }

  //if there is a topic in the opts we just upgrade the our commnad like 

  // alter the suggestion in the help scenario so that help is the first command
  // otherwise the user will be presented 'did you mean 'help'?' instead of 'did you mean "help <command>"?'
  let suggestion = (/:?help:?/).test(opts.id)
    ? ['help', ...opts.id.split(':').filter((cmd) => cmd !== 'help')].join(':')
    : closest(opts.id, commandIDs);

  let readableSuggestion = toConfiguredId(suggestion, this.config);
  const originalCmd = toConfiguredId(opts.id, this.config);
  this.warn(`${chalk.yellow(originalCmd)} is not a ${opts.config.bin} command.`);

  let response = '';
  try {
    if (opts.id === 'help') {readableSuggestion = '--help';}
    response = await CliUx.ux.prompt(`Did you mean ${chalk.blueBright(readableSuggestion)}? [y/n]`, {timeout: 10_000});
  } catch (error) {
    this.log('');
    this.debug(error);
  }

  if (response === 'y') {
    // this will split the original command from the suggested replacement, and gather the remaining args as varargs to help with situations like:
    // confit set foo-bar -> confit:set:foo-bar -> config:set:foo-bar -> config:set foo-bar
    let argv = opts.argv?.length ? opts.argv : opts.id.split(':').slice(suggestion.split(':').length);
    if (suggestion.startsWith('help:')) {
      // the args are the command/partial command you need help for (package:version)
      // we created the suggestion variable to start with "help" so slice the first entry
      argv = suggestion.split(':').slice(1);
      // the command is just the word "help"
      suggestion = 'help';
    }
    if (opts.id === 'help') {
      return this.config.runCommand('--help');
    }
    return this.config.runCommand(suggestion, argv);
  }

  this.error(`Run ${chalk.bold.cyan(binHelp)} for a list of available commands.`, {exit: 127});
};

export default hook;
