import { promises as fPromises } from 'fs';
import Command from '../../core/base';
import { resolve, join } from 'path';
import {load } from '../../core/models/SpecificationFile';
import fs from 'fs-extra';
import { templateFlags } from '../../core/flags/new/template.flags';
import { cyan, gray } from 'picocolors';

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
  static description = 'Creates a new template';
  protected commandName = 'template';
  static readonly successMessage = successMessage;
  static readonly errorMessages = errorMessages;
  static flags = templateFlags();

  async run() {
    const { flags } = await this.parse(template); // NOSONA

    const {
      name: projectName,
      template: templateName,
      file,
      'force-write': forceWrite,
    } = flags;

    const PROJECT_DIRECTORY = join(process.cwd(), projectName);

    const templateDirectory = resolve(
      __dirname,
      '../../../assets/create-template/templates/',
      templateName
    );

    {
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
        await fs.copy(templateDirectory, PROJECT_DIRECTORY);
        this.log(successMessage(projectName));
      } catch (err) {
        this.error(
          `Unable to create the project. Please check the following message for further info about the error:\n\n${err}`
        );
      }
      this.specFile = await load(`${templateDirectory}/asyncapi.yml`);
      this.metricsMetadata.template = flags.template;
    }
  }
}
