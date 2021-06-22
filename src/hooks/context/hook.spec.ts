import {useContextFile} from './hook';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { ContextFile } from './models';

const contextFilePath = path.resolve(os.homedir(), '.asyncapi');

describe('useContextFile should', () => {

	beforeAll(() => {
		fs.writeFileSync(contextFilePath, JSON.stringify({_current: 'home', _contexts: {
			home: '/path',
			notHome: '/some/path'
		}}), {encoding: 'utf-8'});
	})

	test('return contextFileInstance', () => {
		let contextFile: ContextFile = useContextFile().list();
		expect(contextFile.current).toMatch('home');
	})
})