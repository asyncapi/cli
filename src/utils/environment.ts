/**
 * Executes a given function with the BROWSERSLIST environment variable temporarily cleared.
 * This prevents the AsyncAPI generator and its dependencies (like the HTML template,
 * which may use PostCSS/Autoprefixer and Browserslist) from encountering
 * malformed browser queries due to an incorrectly set BROWSERSLIST environment variable.
 *
 * The original BROWSERSLIST value (if any) is restored after the function completes.
 *
 * @param fn The function to execute within the controlled environment.
 * @returns The result of the executed function.
 */
export function withCleanBrowserslistEnv<T>(fn: () => T): T {
  const originalBrowserslistEnv = process.env.BROWSERSLIST;
  try {
    // Clear the BROWSERSLIST environment variable to prevent it from interfering
    // with internal template dependencies that might use browserslist,
    // especially when an invalid value (like a shell command string) is present.
    delete process.env.BROWSERSLIST;
    
    // Optionally, if a specific default browserslist is always desired, one could set it here:
    // process.env.BROWSERSLIST = 'last 2 versions, not dead, > 0.2%';

    return fn();
  } finally {
    // Restore the original BROWSERSLIST environment variable or ensure it remains deleted
    if (originalBrowserslistEnv !== undefined) {
      process.env.BROWSERSLIST = originalBrowserslistEnv;
    } else {
      delete process.env.BROWSERSLIST;
    }
  }
}
