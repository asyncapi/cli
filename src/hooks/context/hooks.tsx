import { Context } from './models';
import { ContextService } from './contextService';
import { container } from 'tsyringe';
import { SpecificationFile } from '../validation';
import { ContextFileNotFoundError } from './errors';

export const useContextFile = () => {
	const contextService: ContextService = container.resolve(ContextService);


	return {
		list: () => {
			try {
				let ctx: Context = contextService.loadContextFile();
				let response = Object.keys(ctx.store).map(c => ({ key: c, path: ctx.store[c] }));
				return { response };
			} catch (error) {
				return { undefined, error };
			}
		},
		current: () => {
			try {
				let ctx: Context = contextService.loadContextFile();
				let response = { key: ctx.current, path: ctx.store[ctx.current] };
				return { response };
			} catch (error) {
				return { undefined, error };
			}
		},
		addContext: (key: string, specFile: SpecificationFile) => {
			try {
				let ctx = contextService.loadContextFile();
				let updatedContext = contextService.addContext(ctx, key, specFile);
				contextService.save(updatedContext);
				let response = "New context added";
				return { response };
			} catch (error) {
				if (error instanceof ContextFileNotFoundError) {
					let context: Context = { current: '', store: {} };
					let newContext = contextService.addContext(context, key, specFile);
					contextService.save(newContext);
					let response = "New context added";
					return { response };
				}
				return { undefined, error }
			}
		},
		setCurrent: (key: string) => {
			try {
				let ctx = contextService.loadContextFile();
				let updateCurrent = contextService.updateCurrent(ctx, key);
				contextService.save(updateCurrent);
				let response = { key: updateCurrent.current, path: updateCurrent.store[updateCurrent.current] };
				return { response };
			} catch (error) {
				return { undefined, error };
			}
		}
	}
}