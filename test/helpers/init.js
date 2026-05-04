const path = require('path');
process.env.TS_NODE_PROJECT = path.resolve('test/tsconfig.json');
process.env.NODE_ENV = 'development';

// Suppress npm progress output during tests to prevent stdout pollution
// (fixes #2004: integration tests fail when npm prints idealTree spinners)
process.env.npm_config_loglevel = 'silent';
process.env.npm_config_progress = 'false';
process.env.NPM_CONFIG_LOGLEVEL = 'silent';
process.env.NPM_CONFIG_PROGRESS = 'false';

global.oclif = global.oclif || {};
global.oclif.columns = 80;

require('events').EventEmitter.defaultMaxListeners = 30;