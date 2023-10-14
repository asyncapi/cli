import {Hook} from '@oclif/core';

const hook: Hook<'command_not_found'> = async function (opts) {
  if (opts.id === 'help') { process.stdout.write(`${opts.id} command not found.\n`);}
};

export default hook;
