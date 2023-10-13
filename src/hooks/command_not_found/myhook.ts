import {Hook} from '@oclif/core';

const hook: Hook<'command_not_found'> = async function (opts) {
  if (opts.id === 'help') { process.stdout.write(`help hook running ${opts.id}\n`);}
};

export default hook;
