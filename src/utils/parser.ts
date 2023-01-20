import { parse, registerSchemaParser } from '@asyncapi/parser';
import openapiSchemaParser from '@asyncapi/openapi-schema-parser';
import avroSchemaParser from '@asyncapi/avro-schema-parser';
import ramlDtSchemaParser from '@asyncapi/raml-dt-schema-parser';

registerSchemaParser(openapiSchemaParser);
registerSchemaParser(avroSchemaParser);
registerSchemaParser(ramlDtSchemaParser);

export { parse };
