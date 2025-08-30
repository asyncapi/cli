import { resolve } from 'path';
import { loadUserConfigPluginsFromInput } from '../../utils/plugins/loader';

export default async function initHook() {
  const inputFileArg = process.argv.find(arg => arg.endsWith('.yaml') || arg.endsWith('.yml'));

  if (inputFileArg) {
    const resolvedInputFile = resolve(process.cwd(), inputFileArg);
    console.error('Loading plugins from input file:', resolvedInputFile);
    await loadUserConfigPluginsFromInput(resolvedInputFile);
  } else {
    console.error('No YAML input file detected for plugin loading.');
  }
}
