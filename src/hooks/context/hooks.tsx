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
				let context: Context = ContextFile.loadContextFile();
				return { context , undefined };
			} catch (error) {
				return { undefined, error }
			}
		},
		current: () => {
			try {
				let context: Context = ContextFile.loadContextFile();
				let response = {
					key: context.current,
					path: context.store[context.current]
				}

				return { response, undefined };
			} catch (error) {
				return { undefined, error };
			}
		},
		addContext: (key: string, specFile: SpecificationFile) => {
			try {
				let context = ContextFile.addContext(key, specFile);
				return { context, undefined };
			} catch (error) {
				return { undefined, error };
			}
		},
		clearCurrent: () => {

		},

		changeCurrent: (key: string) => {
			try {
				let context = ContextFile.updateContext(key);
				ContextFile.save(context);
				return { context, undefined };
			} catch (error) {
				return { undefined, error };
			}
		},
		specFile: () => {

		}
	}
}