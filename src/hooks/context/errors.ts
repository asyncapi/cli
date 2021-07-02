
export class ContextFileNotFoundError extends Error {
	constructor() {
		super();
		this.message = "Context file not found in the home directory";
	}
}

export class ContextNotFoundError extends Error {
	constructor() {
		super();
		this.message = "Context not found";
	}
}

export class KeyNotFoundError extends Error {
	constructor() {
		super();
		this.message = "Key not found";
	}
}

export class DeletingCurrentContext extends Error {
	constructor() {
		super();
		this.message = "Deleting Current Context";
	}
}