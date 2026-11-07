import { ParsedFlags } from '../../domains/models/generate/Flags';
import {
  paramParser,
  disableHooksParser,
  mapBaseURLParser
} from './parseParams';
import {
  registryURLParser,
  registryValidation
} from './registry';

export async function parseGeneratorFlags(
  disableHooks?: string[],
  params?: string[],
  mapBaseUrl?: string,
  registryUrl?: string,
  registryAuth?: string,
  registryToken?: string
): Promise<ParsedFlags> {
  const parsed = {
    params: paramParser(params),
    disableHooks: disableHooksParser(disableHooks),
    mapBaseUrlToFolder: mapBaseURLParser(mapBaseUrl),
  } as ParsedFlags;
  registryURLParser(registryUrl);
  await registryValidation(registryUrl, registryAuth, registryToken);
  return parsed;
}
