import { Command } from '@oclif/core';
import { MetadataFromDocument, MetricMetadata, NewRelicSink, Recorder, Sink, StdOutSink } from '@smoya/asyncapi-adoption-metrics';
import { Parser } from '@asyncapi/parser';
import { Specification } from 'models/SpecificationFile';
import { join, resolve } from 'path';
import { existsSync, readFileSync, writeFile } from 'fs-extra';

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
    await this.recordActionInvoked(commandName);
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
      await recordFunc(await this.recorder);
      await (await this.recorder).flush();
    } catch (e: any) {
      if (e instanceof Error) {
        this.log(`Skipping submitting anonymous metrics due to the following error: ${e.name}: ${e.message}`);
      }
    }
  }

  async finally(error: Error | undefined): Promise<any> {
    await super.finally(error);
    this.metricsMetadata['success'] = error === undefined;
    await this.recordActionFinished(this.id as string, this.metricsMetadata, this.specFile?.text());
  }

  async recorderFromEnv(prefix: string): Promise<Recorder> {
    let sink: Sink = new DiscardSink();
    const analyticsConfigFile = join(process.cwd(), '.asyncapi-analytics');

    if (!existsSync(analyticsConfigFile)) {
      await writeFile(analyticsConfigFile, JSON.stringify({ analyticsEnabled: 'true', infoMessageShown: 'false' }), { encoding: 'utf8' });
    } else {
      const analyticsConfigFileContent = JSON.parse(readFileSync(resolve(analyticsConfigFile), 'utf-8'));
      if (analyticsConfigFileContent.analyticsEnabled === 'false') {
        process.env.ASYNCAPI_METRICS = 'false';
      }
    }
    
    if (process.env.ASYNCAPI_METRICS !== 'false' && process.env.CI !== 'true') {
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
        const analyticsConfigFileContent = JSON.parse(readFileSync(resolve(analyticsConfigFile), 'utf-8'));

        if (existsSync(analyticsConfigFile) && (analyticsConfigFileContent.infoMessageShown === 'false')) {
          this.warn('AsyncAPI anonymously tracks command executions to improve the specification and tools, ensuring no sensitive data reaches our servers. It aids in comprehending how AsyncAPI tools are used and adopted, facilitating ongoing improvements to our specifications and tools.\n\nTo disable tracking, please run the following command :\n  asyncapi config analytics --disable\n\nOnce disabled, if you want to enable tracking again then run:\n  asyncapi config analytics');
          analyticsConfigFileContent.infoMessageShown = 'true';
          await writeFile(analyticsConfigFile, JSON.stringify(analyticsConfigFileContent), { encoding: 'utf8' });
        }        
        break;
      }
    }
  
    return new Recorder(prefix, sink);
  }
}

