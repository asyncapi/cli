import { Flags } from "@oclif/core";
import { Example } from "@oclif/core/lib/interfaces";
import Command from "../base";
import bundle from "@asyncapi/bundler";
import fs from "fs";
import path from "path";
import { ErrorLoadingSpec } from "../errors/specification-file";

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

    try {
      this.resolveFilePaths(argv, flags);
    } catch (error) {
      throw error;
    }

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
    this.log(
      `Check out your shiny new bundled files at ${output}`
    );
  }

  private checkFilePath(filePath: string) {
    try {
      var stats = fs.statSync(path.resolve(process.cwd(), filePath));
    } catch (error) {
      return false;
    }
    return fs.existsSync(filePath) && stats.isFile();
  }

  private resolveFilePaths(arg: any, flags: any) {
    for (const file of arg) {
      if (!this.checkFilePath(file)) throw new ErrorLoadingSpec("file", file);
    }
    if (flags.base) {
      if (!this.checkFilePath(flags.base))
        throw new ErrorLoadingSpec("file", flags.base);
    }
  }
}
