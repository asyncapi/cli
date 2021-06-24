import * as fs from 'fs';
import * as path from 'path';
import { SpecificationFile } from '../validation';
import { CONTEXTFILE_PATH, ALLOWED_SPECFILE_NAME } from './constants';


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

	addContext(key: string, specFile: SpecificationFile) {
		this._contexts[key] = specFile.getSpecificationName();
	}

	static save(contextFile: ContextFile) {
		fs.writeFileSync(CONTEXTFILE_PATH, JSON.stringify(contextFile), { encoding: 'utf-8' });
	}

	static load(): ContextFile {
		if (!fs.existsSync(CONTEXTFILE_PATH)) throw new Error('.asyncapi file not present');

		const { _contexts, _current }: ContextContent = JSON.parse(fs.readFileSync(CONTEXTFILE_PATH, 'utf-8')) as ContextContent;

		return new ContextFile(_current, _contexts);
	}

	static loadSpecFile() {
		let specFilePath = autoDetectSpecFile();
		if (specFilePath) {
			return new SpecificationFile(specFilePath);
		}

		try {
			let contextFile = ContextFile.load();
			//@ts-ignore
			return new SpecificationFile(contextFile.contexts[contextFile.current]);
		} catch (error) {
			throw error;
		}
	}
}

export const autoDetectSpecFile = () => {
	return ALLOWED_SPECFILE_NAME.find(specName => fs.existsSync(path.resolve(process.cwd(), specName)));
}