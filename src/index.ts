export { run } from '@oclif/core';

/**
 * For NodeJS < 15, unhandled rejections are treated as warnings.
 * This is required for consistency in error handling.
 */
process.on('unhandledRejection', (reason) => {
  throw new Error(reason as string);
});
