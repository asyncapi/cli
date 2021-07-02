import { useContextFile } from './hooks';
import * as fs from 'fs';
import { Context } from './models';
import { CONTEXTFILE_PATH } from './constants';
import { SpecificationFile } from '../validation';
import { ContextFileNotFoundError, KeyNotFoundError } from './errors';

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
	if(fs.existsSync(CONTEXTFILE_PATH)) fs.unlinkSync(CONTEXTFILE_PATH);
	fs.writeFileSync(CONTEXTFILE_PATH, JSON.stringify(context), { encoding: 'utf-8' });
}

describe('useContextHook().list', () => {

	test('should return error', () => {
		deleteContextFile();
		let { response, error } = useContextFile().list();
		expect(response).toBeUndefined();
		expect(error).toBeTruthy();
	})

	test('Should return context list ', () => {
		createDummyContext();
		let { response, error } = useContextFile().list();
		expect(error).toBeUndefined();
		expect(response).toBeTruthy();
	})
})

describe('useContextFile().current', () => {
	test("should return error if no context file found", () => {
		deleteContextFile();
		let { response, error } = useContextFile().current();
		expect(response).toBeUndefined();
		expect(error).toBeTruthy();
	});

	test("should return current key and path", () => {
		createDummyContext();
		let { response, error } = useContextFile().current();
		expect(response).toEqual({ key: 'home', path: '/home/projects/asyncapi.yml' });
		expect(error).toBeUndefined();
	})
})


describe('useContextFile().addContext ', () => {
	test("Should save context even if no file is present", () => {
		deleteContextFile();
		let { response, error } = useContextFile().addContext('home', new SpecificationFile('asyncapi.yml'));
		expect(error).toBeUndefined();
		expect(response).toMatch("New context added")
		deleteContextFile();
	})

	test("should save when context file is present", () => {
		createDummyContext();
		let { response, error } = useContextFile().addContext('home', new SpecificationFile('asyncapi.json'));
		expect(error).toBeUndefined();
		expect(response).toMatch('New context added');
	})
});

describe('useContextFile.updateCurrent ', () => {
	test("Should throw ContextFileNotFoundError", () => {
		deleteContextFile();
		let { response, error } = useContextFile().setCurrent('code');
		expect(response).toBeUndefined();
		expect(error instanceof ContextFileNotFoundError).toBeTruthy();
	});

	test("Should throw KeyNotFoundError", () => {
		createDummyContext();
		let { response, error } = useContextFile().setCurrent("name");
		expect(response).toBeUndefined();
		expect(error instanceof KeyNotFoundError).toBeTruthy();
	});

	test('Should update the current context', () => {
		createDummyContext();
		let {response, error} = useContextFile().setCurrent('code')
		expect(error).toBeUndefined();
		expect(response?.key).toMatch('code');
	});
})

