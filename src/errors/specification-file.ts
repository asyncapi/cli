import { NO_CONTEXTS_SAVED } from './context-error';
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
    default: NO_CONTEXTS_SAVED
  }
  constructor(from?: From, param?: string) {
    super();
    if (from === 'file') {
      this.name = 'error loading AsyncAPI document from file';
      this.message = `${param} is an invalid file path`;
    }
    if (from === 'url') {
      this.name = 'error loading AsyncAPI docuement from url';
      this.message = `${param} is an invalid url`;
    }
    if (from === 'context') {
      this.name = 'error loading AsyncAPI document from context';
      this.message = `${param} is an invalid context name`;
    }

    if (!from) {
      this.name = 'error locating AsyncAPI document';
      this.message = this.errorMessages.default;
    }
  }
}
