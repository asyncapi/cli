import Command from '@cli/internal/base';
import { ensureStudio } from '@models/studio-installer';
import { studioInstallFlag } from '@cli/internal/flags/studio.flags';
import { Flags } from '@oclif/core';
import { blueBright } from 'picocolors';

export default class InstallStudio extends Command {
  static readonly description =
    'Install the optional AsyncAPI Studio package (~450MB) before first use';

  static readonly flags = {
    help: Flags.help({ char: 'h' }),
    yes: studioInstallFlag(),
  };

  async run() {
    const { flags } = await this.parse(InstallStudio);
    const studioPath = await ensureStudio(this.config, { yes: flags.yes });
    this.log(`Studio is ready at ${blueBright(studioPath)}.`);
  }
}
