import { useContextFile, useSpecfile } from './hooks';
import { ContextFileNotFoundError, KeyNotFoundError, ContextNotFoundError } from './models';
import { ContextTestingHelper } from '../../constants';
import { SpecificationFile } from '../validation';

let testingVariables = new ContextTestingHelper();


describe('useContextHook().list', () => {

	test('should return error', () => {
		testingVariables.deleteDummyContextFile();
		let { response, error } = useContextFile().list();
		expect(response).toBeUndefined();
		expect(error).toBeTruthy();
	})

	test('Should return context list ', () => {
		testingVariables.createDummyContextFile();
		let { response, error } = useContextFile().list();
		expect(error).toBeUndefined();
		expect(response).toBeTruthy();
	})
})

describe('useContextFile().current', () => {
	test("should return error if no context file found", () => {
		testingVariables.deleteDummyContextFile();
		let { response, error } = useContextFile().current();
		expect(response).toBeUndefined();
		expect(error).toBeTruthy();
	});

	test("should return current key and path", () => {
		testingVariables.createDummyContextFile();
		let { response, error } = useContextFile().current();
		expect(response).toEqual({ key: 'home', path: testingVariables.getPath('home') });
		expect(error).toBeUndefined();
	})
})


describe('useContextFile().addContext ', () => {
	test("Should save context even if no file is present", () => {
		testingVariables.deleteDummyContextFile();
		let { response, error } = useContextFile().addContext('home', new SpecificationFile('./test/specification.yml'));
		expect(error).toBeUndefined();
		expect(response).toMatch("New context added")
		testingVariables.deleteDummyContextFile();
	})

	test("should save when context file is present", () => {
		testingVariables.createDummyContextFile();
		let { response, error } = useContextFile().addContext('home', new SpecificationFile('./test/specification.yml'));
		expect(error).toBeUndefined();
		expect(response).toMatch('New context added');
	})

	test("Auto set current when when adding context for the fist time", () => {
		testingVariables.deleteDummyContextFile();
		let { response, error } = useContextFile().addContext('home', new SpecificationFile("./test/specification.yml"));
		expect(error).toBeUndefined();
		expect(response).toMatch("New context added");
		let { response: res, error: err } = useContextFile().current();
		expect(err).toBeUndefined();
		expect(res?.key).toMatch("home");
		testingVariables.deleteDummyContextFile();
	})
});

describe('useContextFile.updateCurrent ', () => {
	test("Should throw ContextFileNotFoundError", () => {
		testingVariables.deleteDummyContextFile();
		let { response, error } = useContextFile().setCurrent('code');
		expect(response).toBeUndefined();
		expect(error instanceof ContextFileNotFoundError).toBeTruthy();
	});

	test("Should throw KeyNotFoundError", () => {
		testingVariables.createDummyContextFile();
		let { response, error } = useContextFile().setCurrent("name");
		expect(response).toBeUndefined();
		expect(error instanceof KeyNotFoundError).toBeTruthy();
	});

	test('Should update the current context', () => {
		testingVariables.createDummyContextFile();
		let { response, error } = useContextFile().setCurrent('code')
		expect(error).toBeUndefined();
		expect(response?.key).toMatch('code');
	});
})

describe('useContextFile().deleteContext ', () => {
	test("return response string", () => {
		testingVariables.createDummyContextFile();
		let { response, error } = useContextFile().deleteContext('code');
		expect(error).toBeUndefined();
		expect(response).toMatch('context deleted successfully');
	});

	test('return error if deleting current context', () => {
		testingVariables.createDummyContextFile();
		let { response, error } = useContextFile().deleteContext('home');
		expect(response).toMatch("context deleted successfully");
		expect(error).toBeUndefined();
	})
})


describe('useContextFile().getContext', () => {
	test("Should throw ContextFileNotFoundError", () => {
		testingVariables.deleteDummyContextFile();

		let { response, error } = useContextFile().getContext('home');
		expect(response).toBeUndefined();
		expect(error instanceof ContextFileNotFoundError).toBeTruthy();
	});

	test("Should throw ContextNotFoundError", () => {
		testingVariables.createDummyContextFile();
		let { response, error } = useContextFile().getContext("random");
		expect(response).toBeUndefined();
		expect(error instanceof ContextNotFoundError).toBeTruthy();
	});

	test("Should return the appropriate spec file", () => {
		testingVariables.createDummyContextFile();
		let { response, error } = useContextFile().getContext('home');
		expect(error).toBeUndefined();
		expect(response instanceof SpecificationFile).toBeTruthy();
	});
})

describe('useSpecFile should ', () => {
	it('Load spec file from --file flag', () => {
		const { specFile, error } = useSpecfile({ file: './test/specification.yml' });
		expect(error).toBeUndefined();
		expect(specFile instanceof SpecificationFile).toBeTruthy();
	});
	it('Load spec file from --context flag', () => {
		testingVariables.createDummyContextFile();
		const { specFile, error } = useSpecfile({ context: 'home' });
		expect(error).toBeUndefined();
		expect(specFile instanceof SpecificationFile).toBeTruthy();
	});
	it('Load spec file from current context', () => {
		testingVariables.createDummyContextFile();
		const { specFile, error } = useSpecfile({});
		expect(error).toBeUndefined();
		expect(specFile).toBeDefined();
	});
	
	it('Throw error when nothing found', () => {
		testingVariables.deleteDummyContextFile()
		testingVariables.deleteDummyContextFile();
		const { error } = useSpecfile({});
		expect(error).toBeDefined();
	});
})
