import {
  GenerationOptions,
  GenerationResult,
  ServiceResult,
} from '@/interfaces';
import { Specification } from '../models/SpecificationFile';
import { BaseService } from './base.service';

import AsyncAPIGenerator from '@asyncapi/generator';
import { spinner } from '@clack/prompts';
import path from 'path';
import os from 'os';
import { yellow, magenta } from 'picocolors';

export class GeneratorService extends BaseService {
  private defaultInteractive: boolean;

  constructor(interactive = false) {
    super();
    this.defaultInteractive = interactive;
  }

  private templatesNotSupportingV3: Record<string, string> = {
    '@asyncapi/minimaltemplate': 'some link', // For testing purpose
    '@asyncapi/dotnet-nats-template':
      'https://github.com/asyncapi/dotnet-nats-template/issues/384',
    '@asyncapi/ts-nats-template':
      'https://github.com/asyncapi/ts-nats-template/issues/545',
    '@asyncapi/python-paho-template':
      'https://github.com/asyncapi/python-paho-template/issues/189',
    '@asyncapi/nodejs-ws-template':
      'https://github.com/asyncapi/nodejs-ws-template/issues/294',
    '@asyncapi/java-spring-cloud-stream-template':
      'https://github.com/asyncapi/java-spring-cloud-stream-template/issues/336',
    '@asyncapi/go-watermill-template':
      'https://github.com/asyncapi/go-watermill-template/issues/243',
    '@asyncapi/java-spring-template':
      'https://github.com/asyncapi/java-spring-template/issues/308',
    '@asyncapi/php-template':
      'https://github.com/asyncapi/php-template/issues/191',
  };

  /**
   * Verify that a given template support v3, if not, return the link to the issue that needs to be solved.
   */
  private verifyTemplateSupportForV3(template: string) {
    if (this.templatesNotSupportingV3[`${template}`] !== undefined) {
      return this.templatesNotSupportingV3[`${template}`];
    }
    return undefined;
  }

  private getGenerationSuccessMessage(output: string): string {
    return `${yellow('Check out your shiny new generated files at ') + magenta(output) + yellow('.')}\n\n`;
  }

  private checkV3NotSupported(asyncapi: Specification, template: string) {
    if (asyncapi.isAsyncAPI3()) {
      const v3IssueLink = this.verifyTemplateSupportForV3(template);
      if (v3IssueLink !== undefined) {
        return `${template} template does not support AsyncAPI v3 documents, please checkout ${v3IssueLink}`;
      }
    }
  }

  async generate(
    asyncapi: Specification,
    template: string,
    output: string,
    options: GenerationOptions,
    genOption: any,
    interactive = this.defaultInteractive,
  ): Promise<ServiceResult<GenerationResult>> {
    const v3NotSupported = this.checkV3NotSupported(asyncapi, template);
    if (v3NotSupported) {
      return this.createErrorResult(v3NotSupported);
    }

    const generator = new AsyncAPIGenerator(
      template,
      output || path.resolve(os.tmpdir(), 'asyncapi-generator'),
      options,
    );
    const s = interactive
      ? spinner()
      : { start: () => null, stop: (string: string) => console.log(string) };
    s.start('Generation in progress. Keep calm and wait a bit');
    try {
      await generator.generateFromString(asyncapi.text(), {
        ...genOption,
        path: asyncapi,
      });
    } catch (err: any) {
      console.log(err);
      s.stop('Generation failed');
      return this.createErrorResult(err.message, err.diagnostics);
    }
    s.stop(
      this.getGenerationSuccessMessage(output),
    );

    return this.createSuccessResult({
      success: true,
      outputPath: output,
    } as GenerationResult);
  }
}
