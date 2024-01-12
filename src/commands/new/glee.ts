import { Flags } from '@oclif/core';
import { promises as fPromises } from 'fs';
import Command from '../../base';
import { resolve, join } from 'path';
import fs from 'fs-extra';
import { load } from '../../models/SpecificationFile';
import { CliUx } from '@oclif/core';
import path from 'path';
import yaml from 'js-yaml';
export default class NewGlee extends Command {
  static description = 'Creates a new Glee project';

  protected commandName = 'glee';

  static flags = {
    help: Flags.help({ char: 'h' }),
    name: Flags.string({
      char: 'n',
      description: 'name of the project',
      default: 'project',
    }),
    template: Flags.string({
      char: 't',
      description: 'name of the template',
      default: 'default',
    }),
    file: Flags.string({
      char: 'f',
      description: 'path of the file',
    }),
  };

  async run() {
    const { flags } = await this.parse(NewGlee); // NOSONAR

    const { name: projectName, template: templateName, file } = flags;

    const PROJECT_DIRECTORY = join(process.cwd(), projectName);

    const GLEE_TEMPLATES_DIRECTORY = resolve(
      __dirname,
      '../../../assets/create-glee-app/templates/',
      templateName
    );

    const currentTemplateName =
      'https://github.com/KhudaDad414/glee-generator-template';

    if (file && templateName && templateName !== 'default') {
      this.error('You cannot use both --t and --f in the same command.');
    }
    if (file) {
      try {
        const asyncapiInput = (await load(file)) || (await load());

        const serversObject = asyncapiInput.toJson().servers;
        const servers = Object.keys(serversObject);
        const remoteServers = [];
        for (const server of servers) {
          const isRemote = await CliUx.ux.confirm(
            `Is "${server}" a remote server`
          );
          remoteServers.push({ server, isRemote });
        }

        const selectedRemoteServers = remoteServers
          .filter(({ isRemote }) => isRemote)
          .map(({ server }) => server);
        const asyncapiObject = asyncapiInput.toJson();
        asyncapiObject['x-remoteServers'] = selectedRemoteServers;

        delete asyncapiObject.filePath;
        delete asyncapiObject.kind;

        const updatedAsyncApiContent = yaml.dump(asyncapiObject, {
          lineWidth: -1,
        });

        const currentFileDirectory = path.join(__dirname, '../../..', file);

        fs.writeFileSync(currentFileDirectory, updatedAsyncApiContent);

        await this.config.runCommand('generate:fromTemplate', [
          file,
          currentTemplateName,
          `--output=${projectName}`,
        ]);
      } catch (error) {
        console.log({ error });
      }
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
            this.error(
              `Unable to create the project. We tried to access the "${PROJECT_DIRECTORY}" directory but it was not possible due to file access permissions. Please check the write permissions of your current working directory ("${process.cwd()}").`
            );
            break;
          case 'EPERM':
            this.error(
              `Unable to create the project. We tried to create the "${PROJECT_DIRECTORY}" directory but the operation requires elevated privileges. Please check the privileges for your current user.`
            );
            break;
          default:
            this.error(
              `Unable to create the project. Please check the following message for further info about the error:\n\n${err}`
            );
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
