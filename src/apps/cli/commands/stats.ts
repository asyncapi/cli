import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { load } from '@models/SpecificationFile';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import { applyProxyToPath } from '@utils/proxy';
import { ValidationError } from '@errors/validation-error';
import { Parser } from '@asyncapi/parser';

export default class Stats extends Command {
  static description = 'display statistics about an AsyncAPI document';

  static flags = {
    ...proxyFlags(),
  };

  static args = {
    'spec-file': Args.string({
      description: 'spec path, url, or context-name',
      required: false,
    }),
  };

  static examples = [
    'asyncapi stats ./asyncapi.yaml',
    'asyncapi stats https://example.com/asyncapi.yml',
  ];

  async run() {
    const { args, flags } = await this.parse(Stats);
    const filePath = applyProxyToPath(
      args['spec-file'],
      flags['proxyHost'],
      flags['proxyPort'],
    );

    let specFile;
    try {
      specFile = await load(filePath);
    } catch {
      this.error(
        new ValidationError({
          type: filePath ? 'invalid-file' : 'no-spec-found',
          filepath: filePath,
        }),
      );
    }

    const parser = new Parser();
    let parsed;
    try {
      parsed = await parser.parse(specFile.text());
    } catch {
      this.error(
        new ValidationError({
          type: 'invalid-syntax-file',
          filepath: specFile.getFilePath() || 'unknown',
        }),
      );
    }

    const doc = parsed.document;
    if (!doc) {
      this.error('Failed to parse AsyncAPI document.');
      return;
    }

    const channels = doc.channels();
    const operations = doc.operations();
    const messages = doc.messages();
    const schemas = doc.components ? doc.components.schemas : [];
    const servers = doc.servers();
    const info = doc.info();

    const stats = {
      title: info.title(),
      version: info.version(),
      asyncapi: doc.version(),
      channels: channels.length,
      operations: operations.length,
      messages: messages.length,
      schemas: schemas.length,
      servers: servers.length,
    };

    this.log(`📊 AsyncAPI Document Statistics
  Title:      ${stats.title}
  Version:    ${stats.version}
  AsyncAPI:   ${stats.asyncapi}

  Channels:   ${stats.channels}
  Operations: ${stats.operations}
  Messages:   ${stats.messages}
  Schemas:    ${stats.schemas}
  Servers:    ${stats.servers}`);
  }
}
