import { Context, ContextFileNotFoundError, ContextNotFoundError } from './models';
import { ContextService } from './contextService';
import { container } from 'tsyringe';
import { SpecificationFile } from '../validation';

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
					contextService.save(contextService.updateCurrent(newContext, key));
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
		},
		deleteContext: (key: string) => {
			try {
				let ctx = contextService.loadContextFile();
				let updatedContext = contextService.deleteContext(ctx, key);
				contextService.save(updatedContext);
				const response = "context deleted successfully";
				return { response }
			} catch (error) {
				return { undefined, error };
			}
		},
		loadSpecFile: () => {
			try {
				let response: SpecificationFile;
				let autoDetectedSpecFile = contextService.autoDetectSpecFile();
				if (autoDetectedSpecFile) {
					response = new SpecificationFile(autoDetectedSpecFile);
					return { response };
				}
				let context = contextService.loadContextFile();
				//@ts-ignore
				response = new SpecificationFile(context.store[context.current]);
				return { response };

			} catch (error) {
				return { undefined, error };
			}
		},
		getContext: (key: string) => {
			try {
				let ctx = contextService.loadContextFile();
				if (!ctx.store[key]) throw new ContextNotFoundError();
				//@ts-ignore
				let response = new SpecificationFile(ctx.store[key]);
				return { response }
			} catch (error) {
				return { undefined, error };
			}
		}
	}
}