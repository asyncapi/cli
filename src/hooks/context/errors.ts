
export class ContextFileNotFoundError extends Error {
	private readonly _message = "Context file not found in the home directory";
	constructor() {
		super();
	}

	get message() {
		return this._message;
	}
}