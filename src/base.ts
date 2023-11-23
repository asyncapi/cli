import { Command } from '@oclif/core';
import { NewRelicSink, Recorder, Sink, StdOutSink } from '@smoya/asyncapi-adoption-metrics';

class DiscardSink implements Sink {
  async send() {
    // noop
  }
}

export default abstract class extends Command {
  recorder = recorderFromEnv('asyncapi_adoption');

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
