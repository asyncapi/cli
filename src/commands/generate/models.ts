import { generateModels, Languages, ModelinaArgs, ModelinaFlags } from '@asyncapi/modelina-cli';
import Command from '../../base';
import { load } from '../../models/SpecificationFile';
import { formatOutput, parse, validationFlags } from '../../parser';

export default class Models extends Command {
  static readonly description = 'Generates typed models through Modelina';
  static readonly args = ModelinaArgs;
  static readonly flags = {
    ...ModelinaFlags,
    ...validationFlags({ logDiagnostics: false }),
  };
  async run() {
    const { args, flags } = await this.parse(Models);
    const { language, file } = args;
    const inputFile = (await load(file)) || (await load());
    const { document, diagnostics ,status } = await parse(this, inputFile, flags as any);
    if (!document || status === 'invalid') {
      const severityErrors = diagnostics.filter((obj) => obj.severity === 0);
      this.log(`Input is not a correct AsyncAPI document so it cannot be processed.${formatOutput(severityErrors,'stylish','error')}`);
      return;
    }

    const logger = {
      info: (message: string) => {
        this.log(message);
      },
      debug: (message: string) => {
        this.debug(message);
      },
      warn: (message: string) => {
        this.warn(message);
      },
      error: (message: string) => {
        this.error(message);
      },
    };

    await generateModels(flags, document, logger, language as Languages);
  }
}
