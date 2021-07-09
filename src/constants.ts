import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { SpecificationFile } from './hooks/validation';
import { Context } from './hooks/context/models';

export const CONTEXTFILE_PATH = path.resolve(os.homedir(), '.asyncapi');

export class ContextTestingHelper {
	private _context: Context;
	constructor() {
		let homeSpecFile = new SpecificationFile('test/specification.yml');
		let codeSpecFile = new SpecificationFile('test/specification.yml');
		this._context = {
			current: 'home',
			store: {
				home: homeSpecFile.getSpecificationName(),
				code: codeSpecFile.getSpecificationName()
			}
		}
	}

	get context(): Context {
		return this._context;
	}

	createDummyContextFile() {
		fs.writeFileSync(CONTEXTFILE_PATH, JSON.stringify(this._context), {encoding: 'utf-8'});
	}

	deleteDummyContextFile() {
		if(fs.existsSync(CONTEXTFILE_PATH)) fs.unlinkSync(CONTEXTFILE_PATH);
	}

	getPath(key: string){
		return this._context.store[key];
	}
}