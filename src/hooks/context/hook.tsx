import { container } from 'tsyringe';

import { ContextService } from './ContextService';
import { ContextFile } from './models';

export function useContextFile() {
	const contextService: ContextService = container.resolve(ContextService);

	return {
		list: () => {
			let contextFile: ContextFile = contextService.execute();
			return contextFile;
		}
	}
}