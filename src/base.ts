import Command from '@oclif/command';

export default abstract class extends Command {
  async catch(e: any) {
    console.error(`${e.name}: ${e.message}`);
  }
}
