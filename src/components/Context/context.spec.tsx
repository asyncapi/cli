import React from 'react';
import { render } from 'ink-testing-library';
import { ListContexts, ShowCurrentContext, AddContext, SetCurrent } from './context';
import { Context } from '../../hooks/context';
import { CONTEXTFILE_PATH } from '../../hooks/context/constants';
import * as fs from 'fs';

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




describe('listing contexts', () => {
	test("should render error when no context file found", () => {
		deleteContextFile()
		let { lastFrame } = render(<ListContexts />);
		expect(lastFrame()).toMatch("No contexts saved yet.");
	})

	test("Should render the context list", () => {
		createDummyContext();
		let { lastFrame } = render(<ListContexts />);
		expect(lastFrame()).toMatch(
			"home : /home/projects/asyncapi.yml\n" +
			"code : /home/projects/asyncapi.yaml"
		)
	})
})

describe('rendering current context', () => {
	test('showing error if now current context is found', () => {
		deleteContextFile();
		let { lastFrame } = render(<ShowCurrentContext />);
		expect(lastFrame()).toMatch('No contexts saved yet.');
	})

	test('showing current context ', () => {
		createDummyContext();
		let { lastFrame } = render(<ShowCurrentContext />);
		expect(lastFrame()).toMatch("home : /home/projects/asyncapi.yml");
	})
})

describe('AddContext ', () => {
	test("should return message", () => {
		createDummyContext();
		let { lastFrame } = render(<AddContext options={{}} args={['home', 'path']} />);
		expect(lastFrame()).toMatch('New context added');
	})
})

describe('SetContext ', () => {

	test('Should render error message is key is not in store', () => {
		createDummyContext();
		let { lastFrame } = render(<SetCurrent args={['name']} options={{}} />)
		expect(lastFrame()).toMatch('Key not found');
	});

	test('Should render the update context', () => {
		createDummyContext();
		let { lastFrame } = render(<SetCurrent args={['code']} options={{}} />)
		expect(lastFrame()).toMatch("code : /home/projects/asyncapi.yaml");
	});
})