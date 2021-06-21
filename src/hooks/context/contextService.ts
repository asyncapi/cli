import { injectable } from 'tsyringe';
import os from 'os';
import path from 'path';
import fs from 'fs';


@injectable()
export class ContextService {
	//TODO: Check if .asyncapi file exists in the homedir
	//TODO: check if it has content 
	//TODO: create functions to update and read the file
	private readonly _asyncapiPath = path.resolve(os.homedir(), '.ayncapi');

	read() {
		return this.readAsyncapiFile();
	}

	addNewContext(key: string, specPathOrURL: string) {
		let _asyncapi: any = this.readAsyncapiFile();
		_asyncapi.contexts[key] = specPathOrURL;
		this.updateFileContent(_asyncapi);
		return this.readAsyncapiFile();
	}

	setCurrent(key: string) {
		let _asyncApi: any = this.readAsyncapiFile();
		_asyncApi.current = _asyncApi.contexts[key];
		this.updateFileContent(_asyncApi);
		return this.readAsyncapiFile();
	}

	private doesExist() {
		if (!fs.existsSync(this._asyncapiPath)) throw new Error('.asyncapi file does not exist');
		return true;
	}

	private readAsyncapiFile() {
		this.doesExist();
		return JSON.parse(fs.readFileSync(this._asyncapiPath, 'utf-8'));
	}

	private updateFileContent(context: any) {
		fs.writeFileSync(this._asyncapiPath, JSON.stringify(context), { encoding: 'utf-8' });
	}
}