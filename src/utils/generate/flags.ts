import { ParsedFlags } from '../../../domains/models/generate/Flags';
import {
  paramParser,
  disableHooksParser,
  mapBaseURLParser
} from './parseParams';
import {
  registryURLParser,
  registryValidation
} from './registry';

export function parseGeneratorFlags(
  disableHooks?: string[],
  params?: string[],
  mapBaseUrl?: string,
  registryUrl?: string,
  registryAuth?: string,
  registryToken?: string
): ParsedFlags {
  return {
    params: paramParser(params),
    disableHooks: disableHooksParser(disableHooks),
    mapBaseUrlToFolder: mapBaseURLParser(mapBaseUrl),
    registryURLValidation: registryURLParser(registryUrl),
    registryAuthentication: registryValidation(registryUrl, registryAuth, registryToken)
  } as ParsedFlags;
}
