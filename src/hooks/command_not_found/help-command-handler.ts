import {Hook} from '@oclif/core';

const helpCommandHandlerHook: Hook<'command_not_found'> = async function (opts) {
  console.log(opts);
  if (opts.id === 'help') {
    console.log('help command doesn\'t exist');
  }
  // may be figure out a way to exit before the plugin "@oclif/plugin-not-found" kicks in
};

export default helpCommandHandlerHook;
