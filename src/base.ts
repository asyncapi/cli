import { Command } from '@oclif/core';
import { MetadataFromDocument, MetricMetadata, NewRelicSink, Recorder, Sink, StdOutSink } from '@smoya/asyncapi-adoption-metrics';
import { Parser } from '@asyncapi/parser';
import { Specification } from 'models/SpecificationFile';
import { join, resolve } from 'path';
import { existsSync } from 'fs-extra';
import { promises as fPromises } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { homedir } from 'os';

const { readFile, writeFile, stat } = fPromises;

class DiscardSink implements Sink {
  async send() {
    // noop
  }
}

export default abstract class extends Command {
  recorder = this.recorderFromEnv('asyncapi_adoption');
  parser = new Parser();
  metricsMetadata: MetricMetadata = {};
  specFile: Specification | undefined;

  async init(): Promise<void> {
    await super.init();
    const commandName : string = this.id || '';
    await this.recordActionInvoked(commandName, this.metricsMetadata);
  }

  async catch(err: Error & { exitCode?: number; }): Promise<any> {
    try {
      return await super.catch(err);
    } catch (e: any) {
      if (e instanceof Error) {
        this.logToStderr(`${e.name}: ${e.message}`);
        process.exitCode = 1;
      }
    }
  }

  async recordActionFinished(action: string, metadata: MetricMetadata = {}, rawDocument?: string) {
    if (rawDocument !== undefined) {
      try {
        const {document} = await this.parser.parse(rawDocument);
        if (document !== undefined) {
          metadata = MetadataFromDocument(document, metadata);
        }
      } catch (e: any) {
        if (e instanceof Error) {
          this.log(`Skipping submitting anonymous metrics due to the following error: ${e.name}: ${e.message}`);
        }
      }
    }
    
    const callable = async function(recorder: Recorder) {
      await recorder.recordActionFinished(action, metadata);
    };

    await this.recordActionMetric(callable);
  }

  async recordActionInvoked(action: string, metadata?: MetricMetadata) {
    const callable = async function(recorder: Recorder) {
      await recorder.recordActionInvoked(action, metadata);
    };

    await this.recordActionMetric(callable);
  }

  async recordActionMetric(recordFunc: (recorder: Recorder) => Promise<void>) {
    try {
      await this.setSource();
      await recordFunc(await this.recorder);
      await (await this.recorder).flush();
    } catch (e: any) {
      if (e instanceof Error) {
        this.log(`Skipping submitting anonymous metrics due to the following error: ${e.name}: ${e.message}`);
      }
    }
  }

  async setSource() {
    const specFilePath = this.specFile?.getFilePath();
    if (!specFilePath) { return; }
    try {
      const stats = await stat(specFilePath);
      this.metricsMetadata['file_creation_timestamp'] = stats.birthtimeMs;
    } catch (e: any) {
      // If there's an error with the file, we don't handle it here because it's expected to be handled and reported in the 'finally' method of the command.
    }
  }
  async finally(error: Error | undefined): Promise<any> {
    await super.finally(error);
    this.metricsMetadata['success'] = error === undefined;
    await this.recordActionFinished(this.id as string, this.metricsMetadata, this.specFile?.text());
  }
  
  async recorderFromEnv(prefix: string): Promise<Recorder> {
    let sink: Sink = new DiscardSink();
    const analyticsConfigFile = join(homedir(), '.asyncapi-analytics');

    if (!existsSync(analyticsConfigFile)) {
      await writeFile(analyticsConfigFile, JSON.stringify({ analyticsEnabled: 'true', infoMessageShown: 'false', userID: uuidv4()}), { encoding: 'utf8' });
    }

    const analyticsConfigFileContent = JSON.parse(await readFile(resolve(analyticsConfigFile), { encoding: 'utf8' }));
    this.metricsMetadata['user'] = analyticsConfigFileContent.userID;

    if (analyticsConfigFileContent.analyticsEnabled !== 'false' && process.env.CI !== 'true') {
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
        sink = new NewRelicSink(process.env.ASYNCAPI_METRICS_NEWRELIC_KEY || 'eu01xx73a8521047150dd9414f6aedd2FFFFNRAL');

        if (analyticsConfigFileContent.infoMessageShown === 'false') {
          this.log('\nAsyncAPI anonymously tracks command executions to improve the specification and tools, ensuring no sensitive data reaches our servers. It aids in comprehending how AsyncAPI tools are used and adopted, facilitating ongoing improvements to our specifications and tools.\n\nTo disable tracking, please run the following command:\n  asyncapi config analytics --disable\n\nOnce disabled, if you want to enable tracking back again then run:\n  asyncapi config analytics --enable\n');
          analyticsConfigFileContent.infoMessageShown = 'true';
          await writeFile(analyticsConfigFile, JSON.stringify(analyticsConfigFileContent), { encoding: 'utf8' });
        }        
        break;
      }
    }
    
    return new Recorder(prefix, sink);
  }
}
