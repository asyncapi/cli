export class ProxyError extends Error {
  constructor(err: Error) {
    super();
    this.name = 'Error in the Connection';
    this.message = err.message;
  }
}
  
