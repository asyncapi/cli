
export class ContextFileNotFoundError extends Error {
	private readonly _message = "Context file not found in the home directory";
	constructor() {
		super();
	}

	get message() {
		return this._message;
	}
}

export class ContextNotFoundError extends Error {
	private readonly _message = "Context not found";
	constructor(){
		super();
	}

	get message(){
		return this._message;
	}
}