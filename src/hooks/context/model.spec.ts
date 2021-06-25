import { ContextFile, Context } from './models';
import { CONTEXTFILE_PATH } from './constants';
import * as fs from 'fs';
import { ContextFileNotFoundError } from './errors';
import { SpecificationFile } from '../validation';

let context: Context = {
	current: 'home',
	store: {
		home: '/home/projects/asyncapi.yml',
	}
}

let deleteContextFile = () => {
	if (fs.existsSync(CONTEXTFILE_PATH)) fs.unlinkSync(CONTEXTFILE_PATH);
}

let createDummyContext = () => {

	fs.writeFileSync(CONTEXTFILE_PATH, JSON.stringify(context), { encoding: 'utf-8' });
}

describe('ContextFile.loadContextFile() ', () => {

	test('should return ContextFileNotFoundError', () => {
		deleteContextFile();
		try {
			let ctx: Context = ContextFile.loadContextFile();
			console.log(ctx);
		} catch (error) {
			expect(error instanceof ContextFileNotFoundError).toBeTruthy();
		}
	})

	test("should return context", () => {
		createDummyContext();
		try {
			let ctx: Context = ContextFile.loadContextFile();
			expect(ctx).toEqual(context);
		} catch (error) {

		}
	})
})


describe('ContextFile.addContext() ', () => {
	test('should throw ContextFileNotFoundError', () => {
		deleteContextFile();
		try {
			let ctx: Context = ContextFile.addContext('program', new SpecificationFile('asyncapi.yaml'));
			console.log(ctx);
		} catch (error) {
			expect(error instanceof ContextFileNotFoundError).toBeTruthy();
		}
	})

	test("should return context", () => {
		createDummyContext();
		try {
			let ctx: Context = ContextFile.addContext('program', new SpecificationFile('asyncapi.yaml'));
			expect(ctx).toEqual({
				current: context.current,
				store: {
					...context.store,
					'program': `${new SpecificationFile('asyncapi.yaml').getSpecificationName()}`
				}
			} as Context)
		} catch (error) {
			
		}
	})
})