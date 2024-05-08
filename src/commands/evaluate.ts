import { Flags } from '@oclif/core';
import Command from '../base';
import { validationFlags} from '../parser';
import { load } from '../models/SpecificationFile';
import { Parser} from '@asyncapi/parser/cjs';
import { watchFlag } from '../flags';
import { AvroSchemaParser } from '@asyncapi/avro-schema-parser';
import { OpenAPISchemaParser } from '@asyncapi/openapi-schema-parser';
import { RamlDTSchemaParser } from '@asyncapi/raml-dt-schema-parser';
import { ProtoBuffSchemaParser } from '@asyncapi/protobuf-schema-parser';

const parser = new Parser({
  __unstable: {
    resolver: {
      cache: false,
    }
  }
});
  
parser.registerSchemaParser(AvroSchemaParser());
parser.registerSchemaParser(OpenAPISchemaParser());
parser.registerSchemaParser(RamlDTSchemaParser());
parser.registerSchemaParser(ProtoBuffSchemaParser());
export default class evaluate extends Command {
  static description = 'evaluate asyncapi file';

  static flags = {
    help: Flags.help({ char: 'h' }),
    watch: watchFlag(),
    ...validationFlags(),
  };

  static args = [
    { name: 'spec-file', description: 'spec path, url, or context-name', required: false },
  ];

  async run() {
    const { args } = await this.parse(evaluate); //NOSONAR
    const filePath = args['spec-file'];
    this.specFile = await load(filePath);
    const { document} = await parser.parse(this.specFile.text(), { source: this.specFile.getSource() });
    let scoreEvalate = 0;

    if (document?.info().hasDescription()) {
      scoreEvalate+=1;
    }
    if (document?.info().hasLicense()) {
      scoreEvalate+=1;
    }
    if (document?.servers()!==undefined) {
      scoreEvalate+=1;
    }
    if (document?.channels()!==undefined) {
      scoreEvalate+=1;
    }
    console.log((scoreEvalate*100)/4);
  }
}
