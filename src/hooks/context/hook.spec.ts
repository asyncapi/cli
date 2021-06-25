import { useContextFile } from './hooks';
import { CONTEXTFILE_PATH } from './constants';
import { Context } from './models';
import * as fs from 'fs';
import { SpecificationFile } from '../validation';
import { ContextFileNotFoundError } from './errors';

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

describe('useContextFile().list() ', () => {

	test('should return error', () => {
		deleteContextFile();
		let { context, error } = useContextFile().list();
		expect(context).toBeUndefined();
		expect(error instanceof Error).toBeTruthy();
	})

	test('should return context', () => {
		createDummyContext();
		let {context, error} = useContextFile().list();
		expect(error).toBeUndefined();
		expect(context).toEqual(context);
	})
})

describe('useContextFile().addContext() ', () => {
	test('should throw error', () => {
		deleteContextFile();

		let {context, error} = useContextFile().addContext('program', new SpecificationFile('asyncapi.yml'))
		expect(context).toBeUndefined();
		expect(error instanceof ContextFileNotFoundError).toBeTruthy();
	})

	test('should return context ', () => {
		createDummyContext();
		let {context,error} = useContextFile().addContext('program', new SpecificationFile('asyncapi.yml'));
		expect(context).toBeTruthy();
		expect(error).toBeUndefined();
	})
})

