import React from 'react';
import { render } from 'ink-testing-library';
import { ListContexts, ShowCurrentContext, AddContext, SetCurrent } from './Context';
import { ContextTestingHelper } from '../../constants';

let testing = new ContextTestingHelper();

describe('listing contexts', () => {
	test("should render error when no context file found", () => {
		testing.deleteDummyContextFile();
		let { lastFrame } = render(<ListContexts />);
		expect(lastFrame()).toMatch("No contexts saved yet.");
	})

	test("Should render the context list", () => {
		testing.createDummyContextFile()
		let { lastFrame } = render(<ListContexts />);
		expect(lastFrame()).toMatch(
			`home : ${testing.context.store["home"]}\n` +
			`code : ${testing.context.store["code"]}`
		);
	})
})

describe('rendering current context', () => {
	test('showing error if now current context is found', () => {
		testing.deleteDummyContextFile();
		let { lastFrame } = render(<ShowCurrentContext />);
		let message = lastFrame();
		expect(message).toMatch('No contexts saved yet.');
	})

	test('showing current context ', () => {
		testing.createDummyContextFile();
		let { lastFrame } = render(<ShowCurrentContext />);
		expect(lastFrame()).toMatch(`home : ${testing.context.store["home"]}`);
	})
})

describe('AddContext ', () => {
	test("should return message", () => {
		testing.createDummyContextFile();
		let { lastFrame } = render(<AddContext options={{}} args={['home', './test/specification.yml']} />);
		expect(lastFrame()).toMatch('New context added');
	})
})

describe('SetContext ', () => {

	test('Should render error message is key is not in store', () => {
		testing.createDummyContextFile();
		let { lastFrame } = render(<SetCurrent args={['name']} options={{}} />)
		expect(lastFrame()).toMatch('The context you are trying to use is not present');
	});

	test('Should render the update context', () => {
		testing.createDummyContextFile();
		let { lastFrame } = render(<SetCurrent args={['code']} options={{}} />)
		expect(lastFrame()).toMatch(`code : ${testing.context.store['code']}`);
	});
})