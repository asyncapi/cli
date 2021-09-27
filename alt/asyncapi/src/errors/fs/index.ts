export class SpecFileNotFoundError extends Error {
  constructor(specPath: string) {
    super()
    this.message = `File: ${specPath} does not exists or is not a file!`
  }
}