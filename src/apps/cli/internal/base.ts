import { Command } from '@oclif/core';
import {
  MetadataFromDocument,
  MetricMetadata,
  NewRelicSink,
  Recorder,
  Sink,
  StdOutSink,
} from '@smoya/asyncapi-adoption-metrics';
import { Parser } from '@asyncapi/parser';
import { Specification } from '@models/SpecificationFile';
import { join, resolve } from 'path';
import { existsSync } from 'fs-extra';
import { promises as fPromises } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { homedir } from 'os';
import { mapError } from './output/error-mapper';
import { CLI_ERROR_CODES, EXIT_CODES } from '@errors/error-codes';
import {
  isStructuredOutput,
  structuredSuccess,
  StructuredOutput,
  StructuredStatus,
} from './output/types';

const { readFile, writeFile, stat } = fPromises;

class DiscardSink implements Sink {
  async send() {
    // noop
  }
}

// The command currently running, used by the process-wide SIGINT handler.
let isActiveCommandJson: (() => boolean) | undefined;
let sigintHandlerInstalled = false;

function installSigintHandler(): void {
  if (sigintHandlerInstalled || process.env.TEST) {
    return;
  }
  sigintHandlerInstalled = true;
  process.once('SIGINT', () => {
    if (isActiveCommandJson?.()) {
      const message = 'The command was interrupted.';
      process.stdout.write(`${JSON.stringify({
        status: 'error',
        message,
        data: { event: 'server.stopped', reason: 'signal' },
        errors: [{ code: CLI_ERROR_CODES.INTERRUPTED, message }],
      })}\n`);
    }
    // eslint-disable-next-line no-process-exit
    process.exit(EXIT_CODES.INTERRUPTED);
  });
}

export default abstract class extends Command {
  static readonly enableJsonFlag = true;
  recorder = this.recorderFromEnv('asyncapi_adoption');
  parser = new Parser();
  metricsMetadata: MetricMetadata = {};
  specFile: Specification | undefined;

  async init(): Promise<void> {
    process.exitCode = undefined;
    isActiveCommandJson = () => this.jsonEnabled();
    installSigintHandler();
    await super.init();
    const commandName: string = this.id || '';
    await this.recordActionInvoked(commandName, this.metricsMetadata);
  }

  // Overrides oclif's async catch(); handling is synchronous, so return a resolved promise.
  catch(err: Error & { exitCode?: number }): Promise<void> {
    this.parsed = true;
    if (err.message.includes('EEXIT: 0')) {
      process.exitCode = 0;
      return Promise.resolve();
    }

    const mapped = mapError(err);
    process.exitCode = mapped.exitCode;
    if (this.jsonEnabled()) {
      this.logJson(this.toErrorJson(mapped));
    } else {
      this.logToStderr(`${err.name}: ${mapped.message}`);
    }
    return Promise.resolve();
  }

  protected result<T extends object>(
    message: string,
    data: T,
    status: Exclude<StructuredStatus, 'error'> = 'success',
  ): StructuredOutput<T> {
    return structuredSuccess(message, data, status);
  }

  protected toSuccessJson(result: unknown): StructuredOutput {
    if (isStructuredOutput(result)) {
      return result;
    }
    const data = result && typeof result === 'object'
      ? result as Record<string, unknown>
      : {};
    return structuredSuccess('Command completed successfully.', data);
  }

  protected toErrorJson(err: unknown): StructuredOutput {
    const mapped = mapError(err);
    let data: Record<string, unknown> | null = null;
    if (mapped.details !== undefined) {
      data = mapped.details && typeof mapped.details === 'object' && !Array.isArray(mapped.details)
        ? mapped.details as Record<string, unknown>
        : { details: mapped.details };
    }
    return {
      status: 'error',
      message: mapped.message,
      data,
      errors: [{ code: mapped.code, message: mapped.message }],
    };
  }

  public emitStructuredOutput(output: StructuredOutput): void {
    if (this.jsonEnabled()) {
      process.stdout.write(`${JSON.stringify(output)}\n`);
    }
  }

  public emitStructuredError(error: unknown): void {
    this.emitStructuredOutput(this.toErrorJson(error));
  }

  async recordActionFinished(
    action: string,
    metadata: MetricMetadata = {},
    rawDocument?: string,
  ) {
    if (rawDocument !== undefined) {
      try {
        const { document } = await this.parser.parse(rawDocument);
        if (document !== undefined) {
          // @ts-ignore
          metadata = MetadataFromDocument(document, metadata);
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          this.log(
            `Skipping submitting anonymous metrics due to the following error: ${e.name}: ${e.message}`,
          );
        }
      }
    }

    const callable = async function (recorder: Recorder) {
      await recorder.recordActionFinished(action, metadata);
    };

    await this.recordActionMetric(callable);
  }

  async recordActionInvoked(action: string, metadata?: MetricMetadata) {
    const callable = async function (recorder: Recorder) {
      await recorder.recordActionInvoked(action, metadata);
    };

    await this.recordActionMetric(callable);
  }

  async recordActionMetric(recordFunc: (recorder: Recorder) => Promise<void>) {
    try {
      await this.setSource();
      await recordFunc(await this.recorder);
      await (await this.recorder).flush();
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.log(
          `Skipping submitting anonymous metrics due to the following error: ${e.name}: ${e.message}`,
        );
      }
    }
  }

  async setSource() {
    const specFilePath = this.specFile?.getFilePath();
    if (!specFilePath) {
      return;
    }
    try {
      const stats = await stat(specFilePath);
      this.metricsMetadata['file_creation_timestamp'] = stats.birthtimeMs;
    } catch {
      // If there's an error with the file, we don't handle it here because it's expected to be handled and reported in the 'finally' method of the command.
    }
  }
  async finally(error: Error | undefined): Promise<any> {
    await super.finally(error);
    this.metricsMetadata['success'] = error === undefined;
    await this.recordActionFinished(
      this.id as string,
      this.metricsMetadata,
      this.specFile?.text(),
    );
  }

  async recorderFromEnv(prefix: string): Promise<Recorder> {
    let sink: Sink = new DiscardSink();
    const analyticsConfigFile =
      process.env.ASYNCAPI_METRICS_CONFIG_PATH ||
      join(homedir(), '.asyncapi-analytics');

    if (!existsSync(analyticsConfigFile)) {
      await writeFile(
        analyticsConfigFile,
        JSON.stringify({
          analyticsEnabled: 'true',
          infoMessageShown: 'false',
          userID: uuidv4(),
        }),
        { encoding: 'utf8' },
      );
    }

    const analyticsConfigFileContent = JSON.parse(
      await readFile(resolve(analyticsConfigFile), { encoding: 'utf8' }),
    );
    this.metricsMetadata['user'] = analyticsConfigFileContent.userID;

    if (
      analyticsConfigFileContent.analyticsEnabled !== 'false' &&
      process.env.CI !== 'true' &&
      !this.jsonEnabled()
    ) {
      switch (process.env.NODE_ENV) {
      case 'development':
        // NODE_ENV set to `development` in bin/run
        if (!process.env.TEST) {
          // Do not pollute stdout when running tests
          sink = new StdOutSink();
        }
        break;
      case 'production':
        // NODE_ENV set to `production` in bin/run_bin, which is specified in 'bin' package.json section
        sink = new NewRelicSink(
          process.env.ASYNCAPI_METRICS_NEWRELIC_KEY ||
              'eu01xx73a8521047150dd9414f6aedd2FFFFNRAL',
        );

        if (analyticsConfigFileContent.infoMessageShown === 'false') {
          this.log(
            '\nAsyncAPI anonymously tracks command executions to improve the specification and tools, ensuring no sensitive data reaches our servers. It aids in comprehending how AsyncAPI tools are used and adopted, facilitating ongoing improvements to our specifications and tools.\n\nTo disable tracking, please run the following command:\n  asyncapi config analytics --disable\n\nOnce disabled, if you want to enable tracking back again then run:\n  asyncapi config analytics --enable\n',
          );
          analyticsConfigFileContent.infoMessageShown = 'true';
          await writeFile(
            analyticsConfigFile,
            JSON.stringify(analyticsConfigFileContent),
            { encoding: 'utf8' },
          );
        }
        break;
      }
    }

    return new Recorder(prefix, sink);
  }
}
