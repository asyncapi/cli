import fs from 'fs';
import { text, isCancel } from '@clack/prompts';

const OPERATION_CANCELLED_ERROR = 'Operation cancelled';

export async function promptForAsyncAPIPath(): Promise<string> {
  const asyncapi = await text({
    message: 'Please provide the path to the AsyncAPI document',
    placeholder: 'asyncapi.yaml',
    defaultValue: 'asyncapi.yaml',
    validate(value: string) {
      if (!value) {
        return 'The path to the AsyncAPI document is required';
      } else if (!fs.existsSync(value)) {
        return 'The file does not exist';
      }
    }
  });

  if (isCancel(asyncapi)) {
    throw new Error(OPERATION_CANCELLED_ERROR);
  }

  return asyncapi;
}

export async function promptForLanguage(defaultLanguage: string): Promise<string> {
  const language = await text({
    message: 'Please provide the language of the generated client',
    placeholder: defaultLanguage,
    defaultValue: defaultLanguage,
  });

  if (isCancel(language)) {
    throw new Error(OPERATION_CANCELLED_ERROR);
  }

  return language;
}

export async function promptForTemplate(): Promise<string> {
  const template = await text({
    message: 'Please provide the name of the generator template',
    placeholder: '@asyncapi/html-template',
    defaultValue: '@asyncapi/html-template',
  });

  if (isCancel(template)) {
    throw new Error(OPERATION_CANCELLED_ERROR);
  }

  return template;
}

export async function promptForOutputDir(): Promise<string> {
  const output = await text({
    message: 'Please provide the output directory',
    placeholder: './docs',
    validate(value: string) {
      if (!value) {
        return 'The output directory is required';
      } else if (typeof value !== 'string') {
        return 'The output directory must be a string';
      }
    }
  });

  if (isCancel(output)) {
    throw new Error(OPERATION_CANCELLED_ERROR);
  }

  return output;
}
