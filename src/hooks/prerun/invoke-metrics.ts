import {Hook} from '@oclif/core';
// import base from '../../base';

const hook: Hook<'prerun'> = async function (opts) {
  // opts.Command._base.
  // process.stdout.write(`example hook running ${opts.Command.name.toLowerCase()}\n`);
  // await (opts.Command as any as base).recorder.recordActionInvoked(opts.Command.name.toLowerCase());
  return;
};

export default hook;
