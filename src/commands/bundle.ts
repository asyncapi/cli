import { Flags } from "@oclif/core";
import { Example } from "@oclif/core/lib/interfaces";
import Command from "../base";
import bundle from "@asyncapi/bundler";
import fs from "fs";
import path from "path";

export default class Bundle extends Command {
  static description = "Bundle multiple asyncapi files together.";
  static strict = false;

  static examples: Example[] = [
    "asyncapi bundle ./asyncapi.yaml -o final.yaml",
  ];

  static flags = {
    help: Flags.help({ char: "h" }),
    output: Flags.string({ char: "o" }),
    referenceIntoComponents: Flags.boolean({ char: "r" }),
    base: Flags.string({ char: "b" }),
  };

  async run() {
    const { argv, flags } = await this.parse(Bundle);
    const output = flags.output || "main.yml";

    const document = await bundle(
      argv.map((filePath) =>
        fs.readFileSync(path.resolve(process.cwd(), filePath), "utf-8")
      ),
      {
        referenceIntoComponents: flags["referenceIntoComponents"],
        base: flags.base
          ? fs.readFileSync(
              path.resolve(process.cwd(), flags.base || ""),
              "utf-8"
            )
          : undefined,
      }
    );

    const format = path.extname(output);

    if (format === ".yml" || format === ".yaml") {
      fs.writeFileSync(path.resolve(process.cwd(), output), document.yml(), {
        encoding: "utf-8",
      });
    }

    if (format === ".json") {
      fs.writeFileSync(path.resolve(process.cwd(), output), document.json(), {
        encoding: "utf-8",
      });
    }
  }
}
