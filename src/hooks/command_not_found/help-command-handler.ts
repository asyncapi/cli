import {Hook} from '@oclif/core';

const helpCommandHandlerHook: Hook<'command_not_found'> = async function (opts) {
  if (opts.id === 'help') {
    console.log('help command doesn\'t exist try --help');
  }
};

export default helpCommandHandlerHook;
