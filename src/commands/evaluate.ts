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
    let scoreEvaluate = 0;

    if (document?.info().hasDescription()) {
      scoreEvaluate+=0.15;
    }
    if (document?.info().hasLicense()) {
      scoreEvaluate+=0.25;
    }
    if (!document?.servers().isEmpty()) {
      scoreEvaluate+=0.25;
    }
    if (!document?.channels().isEmpty()) {
      scoreEvaluate+=0.35;
    }
    const finalScore = (scoreEvaluate/1)*100;

    this.log('The score of the asyncapi document is ', +finalScore);
  }
}
