import { Args } from '@oclif/core';
import Command from '../../core/base';
// eslint-disable-next-line
// @ts-ignore
import AsyncAPIGenerator from '@asyncapi/generator';
import AsyncAPINewGenerator from 'generator-v2';
import path from 'path';
import os from 'os';
import { load, Specification } from '../../core/models/SpecificationFile';
import { ValidationError } from '../../core/errors/validation-error';
import { GeneratorError } from '../../core/errors/generator-error';
import { Parser } from '@asyncapi/parser';
import { intro, isCancel, spinner } from '@clack/prompts';
import { inverse, yellow, magenta } from 'picocolors';
import { fromTemplateFlags } from '../../core/flags/generate/fromTemplate.flags';
import { proxyFlags } from '../../core/flags/proxy.flags';
import { generateArgs } from '../../core/args/generate.args';
import { parseGeneratorFlags } from '../../core/utils/generate/flags';
import { watcherHandler, runWatchMode } from '../../core/utils/generate/watcher';
import { getMapBaseUrlToFolderResolver } from '../../core/utils/generate/mapBaseUrl';
import { promptForAsyncAPIPath, promptForTemplate, promptForOutputDir } from '../../core/utils/generate/prompts';

const templatesNotSupportingV3: Record<string, string> = {
  '@asyncapi/minimaltemplate': 'some link', // For testing purpose
  '@asyncapi/dotnet-nats-template': 'https://github.com/asyncapi/dotnet-nats-template/issues/384',
  '@asyncapi/ts-nats-template': 'https://github.com/asyncapi/ts-nats-template/issues/545',
  '@asyncapi/python-paho-template': 'https://github.com/asyncapi/python-paho-template/issues/189',
  '@asyncapi/nodejs-ws-template': 'https://github.com/asyncapi/nodejs-ws-template/issues/294',
  '@asyncapi/java-spring-cloud-stream-template': 'https://github.com/asyncapi/java-spring-cloud-stream-template/issues/336',
  '@asyncapi/go-watermill-template': 'https://github.com/asyncapi/go-watermill-template/issues/243',
  '@asyncapi/java-spring-template': 'https://github.com/asyncapi/java-spring-template/issues/308',
  '@asyncapi/php-template': 'https://github.com/asyncapi/php-template/issues/191'
};

/**
 * Verify that a given template support v3, if not, return the link to the issue that needs to be solved.
 */
function verifyTemplateSupportForV3(template: string) {
  if (templatesNotSupportingV3[`${template}`] !== undefined) {
    return templatesNotSupportingV3[`${template}`];
  }
  return undefined;
}

export default class Template extends Command {
  static description = 'Generates whatever you want using templates compatible with AsyncAPI Generator.';

  static examples = [
    'asyncapi generate fromTemplate asyncapi.yaml @asyncapi/html-template --param version=1.0.0 singleFile=true --output ./docs --force-write'
  ];

  static readonly flags = {
    ...fromTemplateFlags(),
    ...proxyFlags()
  };

  static args = {
    ...generateArgs,
    template: Args.string({ description: '- Name of the generator template like for example @asyncapi/html-template or https://github.com/asyncapi/html-template', required: false }),
  };

  parser = new Parser();

  async run() {
    const { args, flags } = await this.parse(Template); // NOSONAR
    const interactive = !flags['no-interactive'];
    let asyncapi = args['asyncapi'] ?? '';
    let template = args['template'] ?? '';
    let output = flags.output as string;
    const {proxyPort,proxyHost} = flags;
    if (interactive) {
      intro(inverse('AsyncAPI Generator'));

      const parsedArgs = await this.parseArgs(args, output);
      asyncapi = parsedArgs.asyncapi;
      template = parsedArgs.template;
      output = parsedArgs.output;
    }

    const parsedFlags = parseGeneratorFlags(
      flags['disable-hook'],
      flags['param'],
      flags['map-base-url'],
      flags['registry-url'],
      flags['registry-auth'],
      flags['registry-token']
    );

    const options = {
      forceWrite: flags['force-write'],
      install: flags.install,
      debug: flags.debug,
      templateParams: parsedFlags.params,
      noOverwriteGlobs: flags['no-overwrite'],
      mapBaseUrlToFolder: parsedFlags.mapBaseUrlToFolder,
      disabledHooks: parsedFlags.disableHooks,
      registry: {
        url: flags['registry-url'],
        auth: flags['registry-auth'],
        token: flags['registry-token']
      }
    };
    
    if (proxyHost && proxyPort) {
      const proxyUrl = `http://${proxyHost}:${proxyPort}`;
      asyncapi = `${asyncapi}+${proxyUrl}`;
    }
    const asyncapiInput = (await load(asyncapi)) || (await load());

    this.specFile = asyncapiInput;
    this.metricsMetadata.template = template;

    const watchTemplate = flags['watch'];
    const genOption: any = {};
    if (flags['map-base-url']) {
      genOption.resolve = { resolve: getMapBaseUrlToFolderResolver(parsedFlags.mapBaseUrlToFolder) };
    }

    if (asyncapiInput.isAsyncAPI3()) {
      const v3IssueLink = verifyTemplateSupportForV3(template);
      if (v3IssueLink !== undefined) {
        this.error(`${template} template does not support AsyncAPI v3 documents, please checkout ${v3IssueLink}`);
      }
    }
    if (flags['use-new-generator']) {
      await this.generateUsingNewGenerator(asyncapi, template, output, options, genOption);
    } else {
      await this.generate(asyncapi, template, output, options, genOption, interactive);
    }
    if (watchTemplate) {
      const watcher = watcherHandler(this, asyncapi, template, output, options, genOption, interactive);
      await runWatchMode(this, asyncapi, template, output, AsyncAPIGenerator, watcher);
    }
  }

  private async parseArgs(args: Record<string, any>, output?: string): Promise<{ asyncapi: string; template: string; output: string; }> {
    let asyncapi = args['asyncapi'];
    let template = args['template'];
    const cancellationMessage = 'Operation cancelled';

    if (!asyncapi) {
      asyncapi = await promptForAsyncAPIPath();
    }

    if (isCancel(asyncapi)) {
      this.error(cancellationMessage, { exit: 1 });
    }

    if (!template) {
      template = await promptForTemplate();
    }

    if (!output) {
      output = await promptForOutputDir();
    }

    if (isCancel(output) || isCancel(template)) {
      this.error(cancellationMessage, { exit: 1 });
    }

    return { asyncapi, template, output };
  }

  private async generate(asyncapi: string | undefined, template: string, output: string, options: any, genOption: any, interactive = true) {
    let specification: Specification;
    try {
      specification = await load(asyncapi);
    } catch (err: any) {
      return this.error(
        new ValidationError({
          type: 'invalid-file',
          filepath: asyncapi,
        }),
        { exit: 1 },
      );
    }
    const generator = new AsyncAPIGenerator(template, output || path.resolve(os.tmpdir(), 'asyncapi-generator'), options);
    const s = interactive ? spinner() : { start: () => null, stop: (string: string) => console.log(string) };
    s.start('Generation in progress. Keep calm and wait a bit');
    try {
      await generator.generateFromString(specification.text(), { ...genOption, path: asyncapi });
    } catch (err: any) {
      s.stop('Generation failed');
      throw new GeneratorError(err);
    }
    s.stop(`${yellow('Check out your shiny new generated files at ') + magenta(output) + yellow('.')}\n`);
  }

  private async generateUsingNewGenerator(asyncapi: string | undefined, template: string, output: string, options: any, genOption: any) {
    let specification: Specification;
    try {
      specification = await load(asyncapi);
    } catch (err: any) {
      return this.error(
        new ValidationError({
          type: 'invalid-file',
          filepath: asyncapi,
        }),
        { exit: 1 },
      );
    }
    const generator = new AsyncAPINewGenerator(template, output || path.resolve(os.tmpdir(), 'asyncapi-generator'), options);
    this.log('Generation in progress. Keep calm and wait a bit');
    try {
      await generator.generateFromString(specification.text(), { ...genOption, path: asyncapi });
    } catch (err: any) {
      this.log('Generation failed');
      throw new GeneratorError(err);
    }
    this.log(`${yellow('Check out your shiny new generated files at ') + magenta(output) + yellow('.')}\n`);
  }
}
