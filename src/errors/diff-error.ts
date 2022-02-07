export class DiffOverrideFileError extends Error {
  constructor() {
    super();
    this.name = 'DiffOverrideFileError';
    this.message = 'Override file not found';
  }
}

export class DiffOverrideJSONError extends Error {
  constructor() {
    super();
    this.name = 'DiffOverrideJSONError';
    this.message = 'Provided override file is not a valid JSON file';
  }
}
