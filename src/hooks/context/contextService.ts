import { injectable } from 'tsyringe';
import { SpecificationFile } from '../validation';
import { ContextFile } from './models';

@injectable()
export class ContextService {
	execute(): ContextFile {
		try {
			const contextFile = ContextFile.load();
			return contextFile;
		} catch (error) {
			return new ContextFile('', {});
		}
	}

	loadSpecFile(): SpecificationFile {
		try {
			let specFile: SpecificationFile = ContextFile.loadSpecFile();
			return specFile
		} catch (error) {
			throw error
		}
	}

}