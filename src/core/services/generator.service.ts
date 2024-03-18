// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AsyncAPIGenerator from '@asyncapi/generator';
import { IGenerator } from '../../ports/generator.interface';
import { GeneratorError } from '../../errors/generator-error';
import path from 'path';
import os from 'os';

export class GeneratorService implements IGenerator {
  static TRANSPILED_TEMPLATE_LOCATION = AsyncAPIGenerator.TRANSPILED_TEMPLATE_LOCATION;
  static DEFAULT_TEMPLATES_DIR = AsyncAPIGenerator.DEFAULT_TEMPLATES_DIR;
  public async generate(
    asyncapi: string | undefined,
    template: string,
    output: string,
    options: any,
    genOption: any,
  ): Promise<void> {
    const generator = new AsyncAPIGenerator(template,
      output || path.resolve(os.tmpdir(), 'asyncapi-generator'),
      options);

    try {
      await generator.generateFromString(asyncapi, genOption);
    } catch (err: any) {
      throw new GeneratorError(err);
    }
  }
}
