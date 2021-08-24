#!/usr/bin/env node

import 'reflect-metadata'; // import globally for `tsyringe` package 
import { render } from 'ink';
import meow from 'meow';
import { commandsRouter } from './CommandsRouter';

const cli = meow({
  autoHelp: false,
  flags: {
    context: {
      alias: 'c',
      type: 'string',
      isRequired: false
    },
    watch: {
      alias: 'w',
      type: 'boolean',
      isRequired: false,
      default: false
    },
    file: {
      alias: 'f',
      type: 'string',
      isRequired: false
    },
    help: {
      alias: 'h'
    }
  }
});

render(commandsRouter(cli));
