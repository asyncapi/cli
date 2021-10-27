class SpecificationFileError extends Error {
  constructor() {
    super();
    this.name = 'SpecificationFileError';
  }
}

export class SpecificationFileNotFound extends SpecificationFileError {
  constructor(filePath: string) {
    super();
    this.message = `File ${filePath} does not exist.`;
  }
}
