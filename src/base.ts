import { Command } from '@oclif/core';
import { Recorder, StdOutSink } from '@smoya/asyncapi-adoption-metrics';

export default abstract class extends Command {
  recorder = new Recorder('asyncapi-adoption', new StdOutSink());

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
