import { Flags } from '@oclif/core';
import { promises as fPromises } from 'fs';
import Command from '../../base';
import { resolve, join } from 'path';
import fs from 'fs-extra';
import { Specification, load } from '../../models/SpecificationFile';
import path from 'path';
import yaml from 'js-yaml';
import { prompt } from 'inquirer';
export default class NewGlee extends Command {
  static description = 'Creates a new Glee project';

  protected commandName = 'glee';

  static flags = {
    help: Flags.help({ char: 'h' }),
    name: Flags.string({
      char: 'n',
      description: 'Name of the Project',
      default: 'project',
    }),
    template: Flags.string({
      char: 't',
      description: 'Name of the Template',
      default: 'default',
    }),
    file: Flags.string({
      char: 'f',
      description:
        'The path to the AsyncAPI file for generating a Glee project.',
    }),
  };

  async getFilteredServers(serversObject: any) {
    const servers = Object.keys(serversObject);

    const localServers = await prompt([
      {
        name: 'LOCAL_SERVERS',
        message:
          'Select all of the servers that you want glee to set up and run a server for (local servers):',
        type: 'checkbox',
        choices() {
          return servers;
        },
      },
    ]);

    return servers.filter(
      (server) => !localServers.LOCAL_SERVERS.includes(server)
    );
  }
  async createTemporaryFile(
    asyncapiInput: Specification,
    filteredRemoteServers: string[],
    file: any
  ) {
    const asyncapiObject = asyncapiInput.toJson();
    asyncapiObject['x-remoteServers'] = filteredRemoteServers;

    delete asyncapiObject.filePath;
    delete asyncapiObject.kind;

    const updatedAsyncApiContent = yaml.dump(asyncapiObject, {
      lineWidth: -1,
    });

    const currentFileDirectory = path.join(__dirname, file);

    fs.writeFileSync(currentFileDirectory, updatedAsyncApiContent);
    return currentFileDirectory;
  }
  async handleGenerateProjectWithFile(
    file: any,
    CURRENT_GLEE_TEMPLATE: any,
    projectName: string
  ) {
    try {
      const asyncapiInput = (await load(file)) || (await load());

      const serversObject = asyncapiInput.toJson().servers;

      const filteredRemoteServers =
        await this.getFilteredServers(serversObject);

      const currentFileDirectory = await this.createTemporaryFile(
        asyncapiInput,
        filteredRemoteServers,
        file
      );

      await this.config.runCommand('generate:fromTemplate', [
        currentFileDirectory,
        CURRENT_GLEE_TEMPLATE,
        `--output=${projectName}`,
      ]);
      fs.unlinkSync(currentFileDirectory);
    } catch (error) {
      console.log({ error });
    }
  }
  async run() {
    const { flags } = await this.parse(NewGlee); // NOSONAR

    const { name: projectName, template: templateName, file } = flags;

    const PROJECT_DIRECTORY = join(process.cwd(), projectName);

    const GLEE_TEMPLATES_DIRECTORY = resolve(
      __dirname,
      '../../../assets/create-glee-app/templates/',
      templateName
    );

    const CURRENT_GLEE_TEMPLATE =
      'https://github.com/KhudaDad414/glee-generator-template';

    if (file && templateName && templateName !== 'default') {
      this.error('You cannot use both --t and --f in the same command.');
    }

    if (file) {
      await this.handleGenerateProjectWithFile(
        file,
        CURRENT_GLEE_TEMPLATE,
        projectName
      );
    } else {
      try {
        await fPromises.mkdir(PROJECT_DIRECTORY);
      } catch (err: any) {
        switch (err.code) {
        case 'EEXIST':
          this.error(
            `Unable to create the project. We tried to use "${projectName}" as the directory of your new project but it already exists (${PROJECT_DIRECTORY}). Please specify a different name for the new project. For example, run the following command instead:\n\n  asyncapi new ${this.commandName} --name ${projectName}-1\n`
          );
          break;
        case 'EACCES':
          this.error(`Unable to create the project. We tried to access the "${PROJECT_DIRECTORY}" directory but it was not possible due to file access permissions. Please check the write permissions of your current working directory ("${process.cwd()}").`);
          break;
        case 'EPERM':
          this.error(`Unable to create the project. We tried to create the "${PROJECT_DIRECTORY}" directory but the operation requires elevated privileges. Please check the privileges for your current user.`);
          break;
        default:
          this.error(`Unable to create the project. Please check the following message for further info about the error:\n\n${err}`);
        }
      }

      try {
        await fs.copy(GLEE_TEMPLATES_DIRECTORY, PROJECT_DIRECTORY);
        await fPromises.rename(
          `${PROJECT_DIRECTORY}/env`,
          `${PROJECT_DIRECTORY}/.env`
        );
        await fPromises.rename(
          `${PROJECT_DIRECTORY}/gitignore`,
          `${PROJECT_DIRECTORY}/.gitignore`
        );
        await fPromises.rename(
          `${PROJECT_DIRECTORY}/README-template.md`,
          `${PROJECT_DIRECTORY}/README.md`
        );
        this.log(
          `Your project "${projectName}" has been created successfully!\n\nNext steps:\n\n  cd ${projectName}\n  npm install\n  npm run dev\n\nAlso, you can already open the project in your favorite editor and start tweaking it.`
        );
      } catch (err) {
        this.error(
          `Unable to create the project. Please check the following message for further info about the error:\n\n${err}`
        );
      }
    }
  }
}
