import { Flags } from "@oclif/core";
import Command from "../../base";

export default class NewGlee extends Command {
  static description = "Creates a new Glee project";
  protected commandName = "glee";

  static flags = {
    help: Flags.help({ char: "h" }),
    name: Flags.string({
      char: "n",
      description: "name of the project",
      default: "project",
    }),
  };

  static args = [
    {
      name: "file",
      description: "spec path, URL or context-name",
      required: true,
    },
  ];
  async run() {
    const { args, flags } = await this.parse(NewGlee); // NOSONAR
    const { file } = args;

    const gitrepo = "https://github.com/KhudaDad414/glee-generator-template";
    try {
      await this.config.runCommand("generate:fromTemplate", [
        file,
        gitrepo,
        `--output=${flags.name}`,
      ]);
    } catch (error) {
      console.log(error);
    }
  }
}
