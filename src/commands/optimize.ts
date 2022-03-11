import {Flags} from '@oclif/core';
import Command from '../base';
import { Optimizer } from '@asyncapi/optimizer';

import { load } from '../models/SpecificationFile';

export default class Optimize extends Command {
  static description = 'It enables users to optimize single AsyncAPI file';

  static flags = {
    help: Flags.help({ char: 'h' }),
    report: Flags.boolean({ char: 'r', description: 'generates report' }),
  }

  static args = [
    { name: 'file', description: 'context,filepath or url', required: true },
  ]

  async run() {
    const { args,flags } = await this.parse(Optimize);
    const filePath = args['file'];
    const file = await load(filePath);
    const optimizer = new Optimizer(file);
    const report = optimizer.getOptimizedDocument();
    this.log(report);
    if (flags.report) {
      const report = await optimizer.getReport();
      this.log(String(report));
    }
  }
}
