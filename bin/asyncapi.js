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
    .command("validate")
    .description("validate the spec file")
    .option('-v, --version <asyncapi-version>', "version of asyncapi spec")
    .option('-c, --context <spec>', "path to the spec file")


program
    .command("create")
    .description("create spec file")
    .option('-c, --context <spec>', "path to the spec file")


program
    .command("generate")
    .option('-c, --context <spec>', "path to the spec file")
    .option('-t, --template <template>', "name of the template")
    .option('-o, --output <outputDir>', "path to the output directory")
    .option('-m, --model <model>', "")


program.on('command:*', (command) => {
    console.error(`error: invalid command ${command}`);
    program.help();
});

program.parse(process.argv);