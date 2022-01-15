class SpecificationFileError extends Error {
  constructor() {
    super();
    this.name = 'SpecificationFileError';
  }
}

export class SpecificationFileNotFound extends SpecificationFileError {
  constructor(filePath?: string) {
    super();
    if (filePath) {
      this.message = `File ${filePath} does not exist.`;
    } else {
      this.message = 'We could not find any AsyncAPI file.';
    }
  }
}

export class SpecificationURLNotFound extends SpecificationFileError {
  constructor(URL: string) {
    super();
    this.message = `Unable to fetch specification file from url: ${URL}`;
  }
}

type From = 'file' | 'url' | 'context'

export class ErrorLoadingSpec extends Error {
  private readonly errorMessages = {
    default: `Specify what AsyncAPI file to be used.
These are your options to specify in the CLI what AsyncAPI file should be used:
 - You can provide a path to the AsyncAPI file: asyncapi <command> path/to/file/asyncapi
 - You can also pass a saved context that points to your AsyncAPI file: asyncapi <command> context-name
 - In case you did not specify a context that you want to use, the CLI checks if there is a default context and uses it. To set default context run: asyncapi context use mycontext
 - In case you did not provide any reference to AsyncAPI file and there is no default context, the CLI detects if in your current working directory you have files like asyncapi.json, asyncapi.yaml, asyncapi.yml. Just rename your file accordingly.
`
  }
  constructor(from?: From, param?: string) {
    super();
    if (from === 'file') {
      this.name = 'Error Loading Specification From File';
      this.message = `${param} is an invalid file path`;
    }
    if (from === 'url') {
      this.name = 'Error Loading Specification From URL';
      this.message = `${param} is an invalid url`;
    }
    if (from === 'context') {
      this.name = 'Error Loading Specification From Context';
      this.message = `${param} is an invalid context name`;
    }

    if (!from) {
      this.name = 'Error Locating Specification';
      this.message = this.errorMessages.default;
    }
  }
}
