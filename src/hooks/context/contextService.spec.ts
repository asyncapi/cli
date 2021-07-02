import { ContextService } from './contextService';
import { Context } from './models';
import { CONTEXTFILE_PATH } from './constants';
import * as fs from 'fs';
import * as path from 'path';
import { SpecificationFile } from '../validation';
import { ContextFileNotFoundError } from './errors';

let context: Context = {
	current: 'home',
	store: {
		home: '/home/projects/asyncapi.yml',
		code: '/home/projects/asyncapi.yaml'
	}
}

let deleteContextFile = () => {
	if (fs.existsSync(CONTEXTFILE_PATH)) fs.unlinkSync(CONTEXTFILE_PATH);
}

let createDummyContext = () => {

	fs.writeFileSync(CONTEXTFILE_PATH, JSON.stringify(context), { encoding: 'utf-8' });
}



describe('ContextService ', () => {
	let contextService = new ContextService();

	test("thorw error while loading contextFile from home directory", () => {
		deleteContextFile();
		try {
			contextService.loadContextFile();
		} catch (error) {
			expect(error instanceof ContextFileNotFoundError).toBeTruthy();	
		}
	})

	test("Load contextFile from the home directory", () => {
		createDummyContext();
		try {
			let ctx = contextService.loadContextFile();
			expect(ctx).toEqual(context);
		} catch (error) {

		}
	})

	test("Should save a given context", () => {
		contextService.save(context);

		try {
			let ctx = contextService.loadContextFile();
			expect(ctx).toEqual(context);
		} catch (error) {

		}
	})
})

const createSpecFileForAutoDetect = () => {
	fs.writeFileSync(path.resolve(process.cwd(), 'asyncapi.yml'), '');
}

const deleteSpecFileForAutoDetect = () => {
	fs.unlinkSync(path.resolve(process.cwd(), 'asyncapi.yml'));
}

describe('ContextService.autoDetect', () => {
	const contextService = new ContextService();

	test("Should return undefined when does not detects anyfile", () => {
		expect(contextService.autoDetectSpecFile()).toBeUndefined();
	});

	test("Should return the name of the file that It autodetected", () => {
		createSpecFileForAutoDetect();
		expect(contextService.autoDetectSpecFile()).toMatch('asyncapi.yml');
		deleteSpecFileForAutoDetect();
	});
})


describe('ContextService.addContext', () => {
	const contextService = new ContextService();
	test("return changed context object", () => {
		let ctx = contextService.addContext(context, 'random', new SpecificationFile('asyncapi.yml'));
		expect(ctx).toBeTruthy();
		expect(ctx.store['random']).toMatch(path.resolve(process.cwd(), 'asyncapi.yml'));
	})
})

describe('ContextService.deleteContext', () => {
	const contextService = new ContextService();

	test("Return changed context object", () => {
		const ctx: Context = contextService.deleteContext(context, 'code');
		expect(ctx.store['code']).toBeUndefined();
	});
})

describe('ContextService.updateCurrent ', () => {
	const contextService = new ContextService();
	test("Should return Context Object with changed current context", () => {
		try {
			const ctx: Context = contextService.updateCurrent(context, "code");
			expect(ctx.current).toMatch('code');
		} catch (error) {

		}
	})
})
