import { CONTEXTFILE_PATH } from './constants';
import * as fs from 'fs';
import * as path from 'path';
import { ContextFileNotFoundError, ContextNotFoundError } from './errors';
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

	static save(context: Context) {
		fs.writeFileSync(CONTEXTFILE_PATH, JSON.stringify(context), {encoding: 'utf-8'});
	}

	static loadSpecFile() {
		//autodetect spec file or load from context 
		const allowedSpecFileNames = ['asyncapi.yml', 'asyncapi.yaml', 'asyncapi.json'];
		let autoDetectedSpecFile = allowedSpecFileNames.find(specName => fs.existsSync(path.resolve(process.cwd(), specName)));
		if(autoDetectedSpecFile){
			return new SpecificationFile(autoDetectedSpecFile);
		}

		try {
			let context: Context = ContextFile.loadContextFile();
			if(context.current && context.store[context.current]){
				//@ts-ignore
				return new SpecificationFile(context.store[context.current]);
			}

			throw new Error("No context found");
		} catch (error) {
			throw error;
		}
	}

	static addContext(key: string, specFile: SpecificationFile): Context {
		try {
			let context: Context = ContextFile.loadContextFile();
			context.store[key] = specFile.getSpecificationName();
			return context;
		} catch (error) {
			throw error;
		}
	}

	static updateContext(key: string): Context {
		try {
			let context: Context = ContextFile.loadContextFile();
			if(!context.store[key]) throw new ContextNotFoundError();
			context.current = key;
			return context;
		} catch (error) {
			throw error;
		}
	}
}