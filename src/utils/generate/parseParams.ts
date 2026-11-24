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

  // For Windows paths like <url>:D:/path or <url>:C:\path, split at the colon before the drive letter
  let delimiterIndex = -1;
  const winDriveMatch = /:([a-zA-Z]:(?:[\\/].*)?)$/.exec(input);
  if (winDriveMatch) {
    delimiterIndex = input.length - winDriveMatch[0].length;
  } else {
    delimiterIndex = input.lastIndexOf(':');
  }

  if (delimiterIndex === -1) {
    throw new Error('Invalid --map-base-url flag. A mapping <url>:<folder> with delimiter : expected.');
  }

  const rawUrl = input.slice(0, delimiterIndex);
  const rawFolder = input.slice(delimiterIndex + 1);

  if (!rawUrl || !rawFolder) {
    throw new Error('Invalid --map-base-url flag. A mapping <url>:<folder> with delimiter : expected.');
  }

  mapBaseURLToFolder.url = rawUrl.replace(/\/$/, '');
  mapBaseURLToFolder.folder = path.resolve(rawFolder);

  const isURL = /^https?:/;
  if (!isURL.test(mapBaseURLToFolder.url.toLowerCase())) {
    throw new Error('Invalid --map-base-url flag. The mapping <url>:<folder> requires a valid http/https url and valid folder with delimiter `:`.');
  }

  return mapBaseURLToFolder;
}
