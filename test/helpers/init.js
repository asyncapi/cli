const path = require('path');
process.env.TS_NODE_PROJECT = path.resolve('test/tsconfig.json');
process.env.NODE_ENV = 'development';

// Source-based assertions and built commands must discover the same test file.
// Seed it while loading both modules, before suites create/delete their fixtures.
const fs = require('fs');
const contextFile = path.resolve(process.env.CUSTOM_CONTEXT_FILE_LOCATION || '.', process.env.CUSTOM_CONTEXT_FILENAME || 'test.asyncapi-cli');
fs.writeFileSync(contextFile, JSON.stringify({ store: {} }));
try {
  require('../../src/domains/models/Context');
  require('../../lib/domains/models/Context');
} finally {
  fs.unlinkSync(contextFile);
}

global.oclif = global.oclif || {};
global.oclif.columns = 80;

require('events').EventEmitter.defaultMaxListeners = 30;
