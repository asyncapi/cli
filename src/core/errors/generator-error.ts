
export class GeneratorError extends Error {
  constructor(err: Error) {
    super();
    this.name = 'Generator Error';
    this.message = err.message;
  }
}
