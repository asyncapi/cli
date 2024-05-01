import { Flags } from '@oclif/core';
import { promises as fPromises } from 'fs';
import Command from '../../base';
import path, { resolve, join } from 'path';
import fs from 'fs-extra';
import { Specification, load } from '../../models/SpecificationFile';
import yaml from 'js-yaml';
import { prompt } from 'inquirer';
// eslint-disable-next-line
// @ts-ignore
import Generator from '@asyncapi/generator';
import { cyan, gray } from 'picocolors';

export const successMessage = (projectName: string) =>
  `🎉 Your Glee project has been successfully created!
⏩ Next steps: follow the instructions ${cyan('below')} to manage your project:

  cd ${projectName}\t\t ${gray('# Navigate to the project directory')}
  npm install\t\t ${gray('# Install the project dependencies')}
  npm run dev\t\t ${gray('# Start the project in development mode')} 

You can also open the project in your favourite editor and start tweaking it.
`;

const errorMessages = {
  alreadyExists: (projectName: string) =>
    `Unable to create the project because the directory "${cyan(projectName)}" already exists at "${process.cwd()}/${projectName}". 
To specify a different name for the new project, please run the command below with a unique project name:

    ${gray('asyncapi new glee --name ') + gray(projectName) + gray('-1')}`,    
};

export default class NewGlee extends Command {
  static description = 'Creates a new Glee project';
  protected commandName = 'glee';
  static readonly successMessage = successMessage;
  static readonly errorMessages = errorMessages;

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
    'force-write': Flags.boolean({
      default: false,
      description:
        'Force writing of the generated files to given directory even if it is a git repo with unstaged files or not empty dir (defaults to false)',
    }),
  };

  async getFilteredServers(serversObject: any) {
    console.log({ serversObject });
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
    return { currentFileDirectory, updatedAsyncApiContent };
  }
  async validateFile(file: any, projectName: any, PROJECT_DIRECTORY: any) {
    try {
      const validExtensions = ['.yaml', '.yml', '.json'];
      const fileExtension = path.extname(file);

      if (!validExtensions.includes(fileExtension)) {
        throw new Error(
          'CLI Support only yml, yaml, and json extension for file'
        );
      }

      if (
        fs.existsSync(PROJECT_DIRECTORY) &&
        fs.readdirSync(PROJECT_DIRECTORY).length > 0
      ) {
        throw new Error(errorMessages.alreadyExists(projectName));
      }
    } catch (error: any) {
      this.log(error.message);
    }
  }

  async handleGenerateProjectWithFile(
    file: any,
    CURRENT_GLEE_TEMPLATE: any,
    projectName: string,
    forceWrite: boolean
  ) {
    const PROJECT_DIRECTORY = path.join(process.cwd(), projectName);
    await this.validateFile(file, projectName, PROJECT_DIRECTORY);

    try {
      console.log(file);
      const asyncapiInput = (await load(file)) || (await load());
      console.log(asyncapiInput);

      const serversObject = asyncapiInput.toJson()?.servers;
      let filteredRemoteServers: any[] = [];
      if (serversObject) {
        filteredRemoteServers = await this.getFilteredServers(serversObject);
      }

      const temporaryFileDirectory = 'asyncapi.yaml';
      const { currentFileDirectory, updatedAsyncApiContent } =
        await this.createTemporaryFile(
          asyncapiInput,
          filteredRemoteServers,
          temporaryFileDirectory
        );

      const generator = new Generator(
        CURRENT_GLEE_TEMPLATE,
        PROJECT_DIRECTORY,
        { forceWrite }
      );
      await generator.generateFromString(updatedAsyncApiContent);
      fs.unlinkSync(currentFileDirectory);

      this.log(
        `Success! Created ${projectName} at ${PROJECT_DIRECTORY}\n\nNext steps:\n\n  cd ${projectName}\n  npm install --ignore-scripts\n\nImplement the function in functions and auth folder and run the project with:\n  npm run dev`
      );
    } catch (err: any) {
      switch (err.code) {
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
  }
  async run() {
    const { flags } = await this.parse(NewGlee); // NOSONAR

    const {
      name: projectName,
      template: templateName,
      file,
      'force-write': forceWrite,
    } = flags;

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
      console.log('file running');
      await this.handleGenerateProjectWithFile(
        file,
        CURRENT_GLEE_TEMPLATE,
        projectName,
        forceWrite
      );
    } else {
      try {
        await fPromises.mkdir(PROJECT_DIRECTORY);
      } catch (err: any) {
        switch (err.code) {
        case 'EEXIST':
          this.error(errorMessages.alreadyExists(projectName));
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
        this.log(successMessage(projectName));
      } catch (err) {
        this.error(
          `Unable to create the project. Please check the following message for further info about the error:\n\n${err}`
        );
      }
    }
  }
}
