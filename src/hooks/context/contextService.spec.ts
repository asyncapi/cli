import { ContextService } from './contextService';
import { Context, ContextFileNotFoundError } from './models';
import { ContextTestingHelper } from '../../constants';
import * as fs from 'fs';
import * as path from 'path';
import { SpecificationFile } from '../validation';

let testing = new ContextTestingHelper();



describe('ContextService ', () => {
	let contextService = new ContextService();

	test("thorw error while loading contextFile from home directory", () => {
		testing.deleteDummyContextFile();
		try {
			contextService.loadContextFile();
		} catch (error) {
			expect(error instanceof ContextFileNotFoundError).toBeTruthy();	
		}
	})

	test("Load contextFile from the home directory", () => {
		testing.createDummyContextFile();
		try {
			let ctx = contextService.loadContextFile();
			expect(ctx).toEqual(testing.context);
		} catch (error) {

		}
	})

	test("Should save a given context", () => {
		contextService.save(testing.context);

		try {
			let ctx = contextService.loadContextFile();
			expect(ctx).toEqual(testing.context);
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
		let ctx = contextService.addContext(testing.context, 'random', new SpecificationFile('./test/specification.yml'));
		expect(ctx).toBeTruthy();
		expect(ctx.store['random']).toMatch(path.resolve(process.cwd(), './test/specification.yml'));
	})
})

describe('ContextService.deleteContext', () => {
	const contextService = new ContextService();

	test("Return changed context object", () => {
		const ctx: Context = contextService.deleteContext(testing.context, 'code');
		expect(ctx.store['code']).toBeUndefined();
	});
})

describe('ContextService.updateCurrent ', () => {
	const contextService = new ContextService();
	test("Should return Context Object with changed current context", () => {
		try {
			const ctx: Context = contextService.updateCurrent(testing.context, "code");
			expect(ctx.current).toMatch('code');
		} catch (error) {

		}
	})
})
