import { Parser } from '@asyncapi/parser/cjs';
import { AvroSchemaParser } from '@asyncapi/parser/cjs/schema-parser/avro-schema-parser';
import { OpenAPISchemaParser } from '@asyncapi/parser/cjs/schema-parser/openapi-schema-parser';
import { RamlSchemaParser } from '@asyncapi/parser/cjs/schema-parser/raml-schema-parser';

const parser = new Parser();

parser.registerSchemaParser(AvroSchemaParser());
parser.registerSchemaParser(OpenAPISchemaParser());
parser.registerSchemaParser(RamlSchemaParser());

export { parser };