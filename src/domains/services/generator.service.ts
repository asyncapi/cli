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
import { getErrorMessage } from '@utils/error-handler';

/**
 * Options passed to the generator for code generation.
 */
interface GeneratorRunOptions {
  path?: Specification;
  [key: string]: unknown;
}

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

  /**
   * Generates code from an AsyncAPI specification using the specified template.
   *
   * @param asyncapi - The AsyncAPI specification to generate from
   * @param template - The template to use for generation
   * @param output - The output directory for generated files
   * @param options - Generator options
   * @param genOption - Additional generator run options
   * @param interactive - Whether to show interactive spinner (default: false)
   * @returns ServiceResult containing generation result or error
   */
  async generate(
    asyncapi: Specification,
    template: string,
    output: string,
    options: GenerationOptions,
    genOption: GeneratorRunOptions = {},
    interactive = this.defaultInteractive,
  ): Promise<ServiceResult<GenerationResult>> {
    const v3NotSupported = this.checkV3NotSupported(asyncapi, template);
    if (v3NotSupported) {
      return this.createErrorResult(v3NotSupported);
    }
    const logs: string[] = [];

    const generator = new AsyncAPIGenerator(
      template,
      output || path.resolve(os.tmpdir(), 'asyncapi-generator'),
      options,
    );
    const s = interactive
      ? spinner()
      : { start: () => null, stop: (message: string) => logs.push(message) };
    s.start('Generation in progress. Keep calm and wait a bit');
    try {
      await generator.generateFromString(asyncapi.text(), {
        ...genOption,
        path: asyncapi,
      });
    } catch (err: unknown) {
      s.stop('Generation failed');
      let errorMessage = getErrorMessage(err, 'Generation failed');

      if (
        errorMessage.includes('404 Not Found') ||
        errorMessage.includes('Installation failed')
      ) {
        errorMessage = `Template '${template}' not found in npm registry.

The template you specified does not exist. This might be because:
  • The template name is misspelled
  • The template doesn't exist in the npm registry
  • You need to use the full package name (e.g., @asyncapi/html-template)

Popular templates: @asyncapi/html-template, @asyncapi/markdown-template, @asyncapi/nodejs-template`;
      } else if (errorMessage.includes('not compatible with')) {
        errorMessage = `${errorMessage}

The template you're using is not compatible with your AsyncAPI document version or generator version.

Possible solutions:
  • Update the template to a newer version
  • Use a different template that supports your AsyncAPI version
  • Check template documentation for compatibility information

Template compatibility info:
  https://www.asyncapi.com/docs/tools/generator/versioning`;
      } else if (
        errorMessage.includes('ENOENT') &&
        errorMessage.includes('template')
      ) {
        errorMessage = `Template '${template}' installation failed or is corrupted.

This usually happens when:
  • The package name is missing the scope (use @asyncapi/html-template instead of html-template)
  • The template was partially downloaded but is incomplete
  • The template package doesn't follow AsyncAPI template structure`;
      } else if (
        errorMessage.toLowerCase().includes('enotfound') ||
        errorMessage.toLowerCase().includes('etimedout') ||
        errorMessage.toLowerCase().includes('network')
      ) {
        errorMessage = `Failed to download template due to network issues.

Possible causes:
  • No internet connection
  • Firewall blocking npm registry access
  • npm registry is temporarily unavailable`;
      }

      const diagnostics =
        err && typeof err === 'object' && 'diagnostics' in err
          ? ((err as { diagnostics?: unknown[] }).diagnostics as Parameters<
              typeof this.createErrorResult
            >[1])
          : undefined;

      return this.createErrorResult(errorMessage, diagnostics);
    }
    s.stop(this.getGenerationSuccessMessage(output));

    return this.createSuccessResult({
      success: true,
      outputPath: output,
      logs,
    } as GenerationResult);
  }
}
