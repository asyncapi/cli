#!/usr/bin/env node

const { Command } = require('commander');
const package = require('../package.json');

const program = new Command();
program
    .name("asyncapi")
    .addHelpCommand(false)
    .version(package.version);


// asyncapi  <action/verb> <resource>

/**
 * Probable commands 
 * - validate 
 * - generate 
 * - create
 * - also connect diff 
 */

program
    .command("validate <asyncapi-ref>")
    .option('-v, --version <asyncapi-version>', "version of asyncapi spec")


program.on('command:*', (command) => {
    console.error(`error: invalid command ${command}`);
    program.help();
});

program.parse(process.argv);