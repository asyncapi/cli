import { Flags } from "@oclif/core";
import { promises as fPromises } from "fs";
import Command from "../../base";
import { resolve, join } from "path";
import fs from "fs-extra";
import { load } from "../../models/SpecificationFile";
import { parse } from "../../parser";
import { createTypes } from "../../utils/createTypes";
import Handlebars from "handlebars";
import fileTemplate from "../../utils/functionTemplate";

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

    const projectName = flags.name;

    const PROJECT_DIRECTORY = join(process.cwd(), projectName);
    const GLEE_TEMPLATES_DIRECTORY = resolve(
      __dirname,
      "../../../assets/create-glee-app/templates/default",
    );
    let response: any;
    let asyncApiFile: any = "";
    const operationList: any = [];
    const serverList: any = [];

    try {
      await fPromises.mkdir(PROJECT_DIRECTORY);
      const document = await load(args.file);
      response = await parse(this, document);

      asyncApiFile = document.text();

      const operationArray: Array<any> = Object.entries(
        response.document._json.operations,
      );
      for (const value of operationArray) {
        const currentFunctionObject = {
          name: "",
          payload: {},
        };

        currentFunctionObject.name = value[0];
        currentFunctionObject.payload = value[1].messages;
        operationList.push(currentFunctionObject);
      }

      const serverArray: Array<any> = Object.entries(
        response.document._json.servers,
      );
      for (const value of serverArray) {
        serverList.push(value[0]);
      }
    } catch (err: any) {
      switch (err.code) {
        case "EEXIST":
          this.error(
            `Unable to create the project. We tried to use "${projectName}" as the directory of your new project but it already exists (${PROJECT_DIRECTORY}). Please specify a different name for the new project. For example, run the following command instead:\n\n  asyncapi new ${this.commandName} --name ${projectName}-1\n`,
          );
          break;
        case "EACCES":
          this.error(
            `Unable to create the project. We tried to access the "${PROJECT_DIRECTORY}" directory but it was not possible due to file access permissions. Please check the write permissions of your current working directory ("${process.cwd()}").`,
          );
          break;
        case "EPERM":
          this.error(
            `Unable to create the project. We tried to create the "${PROJECT_DIRECTORY}" directory but the operation requires elevated privileges. Please check the privileges for your current user.`,
          );
          break;
        default:
          this.error(
            `Unable to create the project. Please check the following message for further info about the error:\n\n${err}`,
          );
      }
    }

    const createOperationFunction = async () => {
      for (const value of operationList) {
        if (value.name.includes(".")) {
          let name = value.name.split(".");
          name =
            name[0].toLowerCase() +
            name[1].charAt(0).toUpperCase() +
            name[1].slice(1).toLowerCase();

          value.name = name;
        }
        const payloadType = await createTypes(value.payload);
        const template = Handlebars.compile(fileTemplate);
        const fileContent = template({
          payloadType: payloadType,
          functionName: value.name,
        });
        await fPromises.writeFile(
          `${PROJECT_DIRECTORY}/functions/${value.name}.ts`,
          fileContent,
        );
      }
    };

    const addServerToEnv = async () => {
      for (const value of serverList) {
        await fPromises.writeFile(
          `${PROJECT_DIRECTORY}/.env`,
          `GLEE_SERVER_NAMES=${value}`,
        );
      }
    };

    try {
      await fs.copy(GLEE_TEMPLATES_DIRECTORY, PROJECT_DIRECTORY);
      await fPromises.rename(
        `${PROJECT_DIRECTORY}/env`,
        `${PROJECT_DIRECTORY}/.env`,
      );
      await fPromises.rename(
        `${PROJECT_DIRECTORY}/gitignore`,
        `${PROJECT_DIRECTORY}/.gitignore`,
      );
      await fPromises.rename(
        `${PROJECT_DIRECTORY}/README-template.md`,
        `${PROJECT_DIRECTORY}/README.md`,
      );

      await createOperationFunction();
      await fPromises.unlink(`${PROJECT_DIRECTORY}/functions/onHello.js`);

      await fPromises.writeFile(
        `${PROJECT_DIRECTORY}/asyncapi.yaml`,
        asyncApiFile,
      );

      await addServerToEnv();
      this.log(
        `Your project "${projectName}" has been created successfully!\n\nNext steps:\n\n  cd ${projectName}\n  npm install\n  npm run dev\n\nAlso, you can already open the project in your favorite editor and start tweaking it.`,
      );
    } catch (err) {
      this.error(
        `Unable to create the project. Please check the following message for further info about the error:\n\n${err}`,
      );
    }
  }
}
