import { promises as fPromises } from 'fs';
import Command from '@cli/internal/base';
import { resolve, join } from 'path';
import { load } from '@models/SpecificationFile';
import fs from 'fs-extra';
import { templateFlags } from '@cli/internal/flags/new/template.flags';
import { cyan, gray } from 'picocolors';
import jsonfile from 'jsonfile';
import path from 'path';
import { ApplicationError } from '@errors/application-error';
import { CLI_ERROR_CODES } from '@errors/error-codes';

export const successMessage = (projectName: string) =>
  `🎉 Your template is succesfully created
⏩ Next steps: follow the instructions ${cyan('below')} to manage your project:

  cd ${projectName}\t\t ${gray('# Navigate to the project directory')}
  npm install\t\t ${gray('# Install the project dependencies')}
  asyncapi generate fromTemplate <templateName> ../${projectName} \t\t ${gray('# Execute the template from anasyncapi document')}

You can also open the project in your favourite editor and start tweaking it.
`;

const errorMessages = {
  alreadyExists: (projectName: string) =>
    `Unable to create the project because the directory "${cyan(projectName)}" already exists at "${process.cwd()}/${projectName}".
To specify a different name for the new project, please run the command below with a unique project name:

    ${gray('asyncapi new template --name ') + gray(projectName) + gray('-1')}`,
};

export default class template extends Command {
  static readonly description = 'Creates a new template';
  protected commandName = 'template';
  static readonly successMessage = successMessage;
  static readonly errorMessages = errorMessages;
  static readonly flags = templateFlags();

  async run() {
    const { flags } = await this.parse(template); // NOSONAR

    const { name: projectName, template: templateName } = flags;

    const PROJECT_DIRECTORY = join(process.cwd(), projectName);

    const templateDirectory = resolve(
      __dirname,
      '../../../../../assets/create-template/templates/',
      templateName,
    );

    try {
      await fPromises.mkdir(PROJECT_DIRECTORY);
    } catch (err: any) {
      switch (err.code) {
      case 'EEXIST':
        throw new ApplicationError(
          CLI_ERROR_CODES.DIRECTORY_ALREADY_EXISTS,
          errorMessages.alreadyExists(projectName),
          { cause: err, details: { path: PROJECT_DIRECTORY } },
        );
      case 'EACCES':
        throw new ApplicationError(
          CLI_ERROR_CODES.FILE_PERMISSION_DENIED,
          `Unable to create the project. We tried to access the "${PROJECT_DIRECTORY}" directory but it was not possible due to file access permissions. Please check the write permissions of your current working directory ("${process.cwd()}").`,
          { cause: err, details: { path: PROJECT_DIRECTORY } },
        );
      case 'EPERM':
        throw new ApplicationError(
          CLI_ERROR_CODES.DIRECTORY_CREATE_FAILED,
          `Unable to create the project. We tried to create the "${PROJECT_DIRECTORY}" directory but the operation requires elevated privileges. Please check the privileges for your current user.`,
          { cause: err, details: { path: PROJECT_DIRECTORY } },
        );
      default:
        throw new ApplicationError(
          CLI_ERROR_CODES.DIRECTORY_CREATE_FAILED,
          `Unable to create the project. Please check the following message for further info about the error:\n\n${err}`,
          { cause: err, details: { path: PROJECT_DIRECTORY } },
        );
      }
    }

    try {
      await copyAndModify(templateDirectory, PROJECT_DIRECTORY, projectName);
      this.log(successMessage(projectName));
    } catch (err) {
      throw new ApplicationError(
        CLI_ERROR_CODES.TEMPLATE_COPY_FAILED,
        `Unable to create the project. Please check the following message for further info about the error:\n\n${err}`,
        { cause: err, details: { path: PROJECT_DIRECTORY } },
      );
    }
    this.specFile = await load(`${templateDirectory}/asyncapi.yaml`);
    this.metricsMetadata.template = flags.template;
    return this.result('The template has been successfully created.', {
      path: PROJECT_DIRECTORY,
      name: projectName,
      template: templateName,
      createdFiles: await listFiles(PROJECT_DIRECTORY),
      warnings: [],
    });
  }
}

async function copyAndModify(
  templateDirectory: string,
  PROJECT_DIRECTORY: string,
  projectName: string,
) {
  const packageJsonPath = path.join(templateDirectory, 'package.json');
  await fs.copy(templateDirectory, PROJECT_DIRECTORY, {
    filter: (src) => {
      return !src.endsWith('package.json');
    },
  });
  const packageData = await jsonfile.readFile(packageJsonPath);
  if (packageData.generator && 'renderer' in packageData.generator) {
    packageData.generator.renderer = 'react';
  }
  if (packageData.name) {
    packageData.name = projectName;
  }

  await fs.writeJSON(`${PROJECT_DIRECTORY}/package.json`, packageData, {
    spaces: 2,
  });
}

async function listFiles(directory: string, relativeTo = directory): Promise<string[]> {
  const entries = await fPromises.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = join(directory, entry.name);
    return entry.isDirectory()
      ? listFiles(entryPath, relativeTo)
      : [path.relative(relativeTo, entryPath)];
  }));
  return files.flat().sort((a, b) => a.localeCompare(b));
}
