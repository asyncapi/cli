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
