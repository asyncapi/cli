import { Command } from '@oclif/core';
import { MetadataFromDocument, MetricMetadata, NewRelicSink, Recorder, Sink, StdOutSink } from '@smoya/asyncapi-adoption-metrics';
import { Parser } from '@asyncapi/parser';

class DiscardSink implements Sink {
  async send() {
    // noop
  }
}

export default abstract class extends Command {
  recorder = recorderFromEnv('asyncapi_adoption');
  parser = new Parser();

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

  async recordActionExecuted(action: string, metadata: MetricMetadata = {}, rawDocument?: string) {
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
      await recorder.recordActionExecuted(action, metadata);
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
      await recordFunc(this.recorder);
      await this.recorder.flush();
    } catch (e: any) {
      if (e instanceof Error) {
        this.log(`Skipping submitting anonymous metrics due to the following error: ${e.name}: ${e.message}`);
      }
    }
  }

  async init(): Promise<void> {
    await super.init();
    const commandName : string = this.id || '';
    await this.recordActionInvoked(commandName);
  }
}

function recorderFromEnv(prefix: string): Recorder {
  let sink: Sink = new DiscardSink();
  if (process.env.ASYNCAPI_METRICS !== 'false') {
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
      sink = new NewRelicSink('eu01xx73a8521047150dd9414f6aedd2FFFFNRAL');
      break;
    }
  }

  return new Recorder(prefix, sink);
}
