import path from 'path';

export function paramParser(inputs?: string[]) {
  if (!inputs) { return {}; }
  const params: Record<string, any> = {};
  for (const input of inputs) {
    if (!input.includes('=')) {
      throw new Error(`Invalid param ${input}. It must be in the format of --param name1=value1 name2=value2 `);
    }
    const [paramName, paramValue] = input.split(/=(.+)/, 2);
    params[String(paramName)] = paramValue;
  }
  return params;
}

export function disableHooksParser(inputs?: string[]) {
  if (!inputs) { return {}; }
  const disableHooks: Record<string, any> = {};

  for (const input of inputs) {
    const [hookType, hookNames] = input.split(/=/);
    if (!hookType) {
      throw new Error('Invalid --disable-hook flag. It must be in the format of: --disable-hook <hookType> or --disable-hook <hookType>=<hookName1>,<hookName2>,...');
    }
    if (hookNames) {
      disableHooks[String(hookType)] = hookNames.split(',');
    } else {
      disableHooks[String(hookType)] = true;
    }
  }
  return disableHooks;
}

export function mapBaseURLParser(input?: string) {
  if (!input) { return; }
  const mapBaseURLToFolder: any = {};
  const re = /(.*):(.*)/g; // NOSONAR
  let mapping: any[] | null = [];
  if ((mapping = re.exec(input)) === null || mapping.length !== 3) {
    throw new Error('Invalid --map-base-url flag. A mapping <url>:<folder> with delimiter : expected.');
  }

  mapBaseURLToFolder.url = mapping[1].replace(/\/$/, '');
  mapBaseURLToFolder.folder = path.resolve(mapping[2]);

  const isURL = /^https?:/;
  if (!isURL.test(mapBaseURLToFolder.url.toLowerCase())) {
    throw new Error('Invalid --map-base-url flag. The mapping <url>:<folder> requires a valid http/https url and valid folder with delimiter `:`.');
  }

  return mapBaseURLToFolder;
}
