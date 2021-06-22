import { injectable } from 'tsyringe';
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
}