import { ContextService } from './contextService';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { ContextFile } from './models';

describe('Context Service should', () => {
	beforeEach(() => {
		const contextFilePath = path.resolve(os.homedir(), '.asyncapi');
		if (fs.existsSync(contextFilePath)) fs.unlinkSync(contextFilePath);
	})

	test('should return contextFile object', () => {
		let contextService = new ContextService();
		let contextFile = contextService.execute();
		expect(contextFile instanceof ContextFile);
	})
})

describe('Context Service should', () => {
	beforeEach(() => {
		const contextFilePath = path.resolve(os.homedir(), '.asyncapi');
		fs.writeFileSync(contextFilePath, JSON.stringify({ _current: 'home', _contexts: { home: '/path', custom: '/some/path' } }));
	})

	test('should return contextFile with data', () => {
		let contextService = new ContextService();
		let contextFile = contextService.execute();
		expect(contextFile.current).toMatch(/home/);
		expect(contextFile.contexts).toEqual({ home: '/path', custom: '/some/path' });
	})
})