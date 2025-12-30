export { run } from '@oclif/core';

// Export utilities for external consumption
export * from './utils/error-handler';
export * from './utils/validation';
export * from './utils/proxy';

// Export interfaces
export * from './interfaces';

/**
 * For NodeJS < 15, unhandled rejections are treated as warnings.
 * This is required for consistency in error handling.
 */
process.on('unhandledRejection', (reason) => {
  throw new Error(reason as string);
});
