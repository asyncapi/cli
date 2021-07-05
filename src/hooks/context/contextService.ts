import { injectable } from 'tsyringe';
import { Context, ContextFileNotFoundError,KeyNotFoundError, DeletingCurrentContextError } from './models';
import { CONTEXTFILE_PATH } from './constants';
import * as fs from 'fs';
import * as path from 'path';
import { SpecificationFile } from '../validation';

@injectable()
export class ContextService {
	loadContextFile(): Context {
		if (!fs.existsSync(CONTEXTFILE_PATH)) throw new ContextFileNotFoundError();
		return JSON.parse(fs.readFileSync(CONTEXTFILE_PATH, 'utf-8')) as Context;
	}

	save(context: Context) {
		fs.writeFileSync(CONTEXTFILE_PATH, JSON.stringify(context), { encoding: 'utf-8' });
	}

	autoDetectSpecFile(): string | undefined {
		const allowedSpecFileNames = ['asyncapi.yml', 'asyncapi.yaml', 'asyncapi.json'];
		let autoDetectedSpecFile = allowedSpecFileNames.find(specName => fs.existsSync(path.resolve(process.cwd(), specName)));
		return autoDetectedSpecFile;
	}

	addContext(context: Context, key: string, specFile: SpecificationFile): Context {
		context.store[key] = specFile.getSpecificationName();
		return context;
	}

	deleteContext(context: Context, key: string): Context {
		if(context.current === key) throw new DeletingCurrentContextError();
		delete context.store[key];
		return context;
	}

	updateCurrent(context: Context, key: string): Context {
		if (!context.store[key]) throw new KeyNotFoundError(); 
		context.current = key;
		return context;
	}
}