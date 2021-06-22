import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';


export interface Contexts {
	[name: string]: string
}

export interface ContextContent {
	_current: string,
	_contexts: Contexts
}

export class ContextFile {
	private _current: string;
	private _contexts: Contexts;

	constructor(current: string, contexts: Contexts) {
		this._current = current;
		this._contexts = contexts;
	}

	get current() { return this._current };

	get contexts() { return this._contexts };

	changeCurrent(key: string) {
		if (!this._contexts[key]) throw new Error("no such context exists");
		this._current = key;
	}

	addContext(key: string, pathToSpecOrURL: string) {
		this._contexts[key] = pathToSpecOrURL;
	}

	static save(contextFile: ContextFile) {
		const contextFilePath = path.resolve(os.homedir(), '.asyncapi');
		fs.writeFileSync(contextFilePath, JSON.stringify(contextFile), { encoding: 'utf-8' });
	}

	static load(): ContextFile {
		const contextFilePath = path.resolve(os.homedir(), '.asyncapi');
		if (!fs.existsSync(contextFilePath)) throw new Error('.asyncapi file not present');

		const { _contexts, _current }: ContextContent = JSON.parse(fs.readFileSync(contextFilePath, 'utf-8')) as ContextContent;

		return new ContextFile(_current, _contexts);
	}
}