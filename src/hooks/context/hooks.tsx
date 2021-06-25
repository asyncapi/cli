import { SpecificationFile } from '../validation'
import { Context, ContextFile } from './models';

export interface Result {
	result: Context | SpecificationFile | undefined,
	error: Error | undefined
}

export const useContextFile = () => {
	return {
		list: () => {
			try {
				let context = ContextFile.loadContextFile();
				return { context, undefined };
			} catch (error) {
				return { undefined, error }
			}
		},
		addContext: (key: string, specFile: SpecificationFile) => {
			try {
				let context = ContextFile.addContext(key, specFile);
				return { context, undefined };
			} catch (error) {
				return { undefined, error };
			}
		}
	}
}