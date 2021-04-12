#!/usr/bin/env node

const { Command } = require('commander');
const package = require('../package.json');

const program = new Command();
program
    .name("asyncapi")
    .addHelpCommand(false)
    .version(package.version);


// asyncapi <asyncapi-ref> <action/verb> <resource>



program.on('command:*', (command) => {
    console.error(`error: invalid command ${command}`);
    program.help();
});

program.parse(process.argv);