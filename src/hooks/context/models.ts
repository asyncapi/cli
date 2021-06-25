import { CONTEXTFILE_PATH } from './constants';
import * as fs from 'fs';
import { ContextFileNotFoundError } from './errors';
import { SpecificationFile } from '../validation';

export interface Context {
	current: string,
	store: {
		[name: string]: string
	}
}

export class ContextFile {

	static loadContextFile(): Context {
		if (!fs.existsSync(CONTEXTFILE_PATH)) throw new ContextFileNotFoundError();
		return JSON.parse(fs.readFileSync(CONTEXTFILE_PATH, 'utf-8'));
	}

	static loadSpecFile() {

	}

	static addContext(key: string, specFile: SpecificationFile) {
		try {
			let context: Context = ContextFile.loadContextFile();
			context.store[key] = specFile.getSpecificationName();
			return context;
		} catch (error) {
			throw error;
		}
	}
}