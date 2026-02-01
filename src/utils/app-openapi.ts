import { promises as fs } from 'node:fs';
import path from 'node:path';

import YAML from 'js-yaml';
import $RefParser from '@apidevtools/json-schema-ref-parser';

let parsedOpenAPI: object | undefined = undefined;

/**
 * Retrieve application's OpenAPI document.
 */
export async function getAppOpenAPI(): Promise<any> {
  if (parsedOpenAPI) {
    return parsedOpenAPI;
  }

  const openaAPI = await fs.readFile(
    path.join(__dirname, '../../openapi.yaml'),
    'utf-8',
  );
  parsedOpenAPI = YAML.load(openaAPI) as object;
  // due to the fact that `@asyncapi/specs: 3.0.0` have moved to a new way of bundling schemas, it makes no sense to resolve the references for AsyncAPI specs
  (parsedOpenAPI as any).components.schemas.AsyncAPIDocument.oneOf = {
    type: ['string', 'object'],
  };
  const refParser = new $RefParser();
  await refParser.dereference(parsedOpenAPI);

  return parsedOpenAPI;
}
