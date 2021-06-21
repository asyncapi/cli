import { ContextService } from './contextService';
import os from 'os';
import path from 'path';
import fs from 'fs';

describe('When .asyncapi file is missing ContextService should', () => {
	const contextService = new ContextService();

	beforeEach(() => {
		let asyncApiPath = path.resolve(os.homedir(), '.asyncapi');
		if (fs.existsSync(asyncApiPath)) {
			fs.unlinkSync(asyncApiPath);
		}
	})

	test('Should throw error while reading', () => {
		try {
			let context = contextService.read();
			console.log(context);
		} catch (error) {
			expect(error.message).toMatch(".asyncapi file does not exist");
		}
	})

	test('Should throw error while adding new Context', () => {
		try {
			contextService.addNewContext('global', '/path/to/file');
		} catch (error) {
			expect(error.message).toMatch(".asyncapi file does not exist");
		}
	})

	test('Should throw error while setting current context', () => {
		try {
			contextService.setCurrent('global');
		} catch (error) {
			expect(error.message).toMatch(".asyncapi file does not exist");
		}
	})
})

describe('when .asyncapi file exists ContextService should', () => {
	const contextService = new ContextService();

	beforeEach(() => {
		let asyncApiPath = path.resolve(os.homedir(), '.asyncapi');
		fs.writeFileSync(asyncApiPath, JSON.stringify({
			current: {
				'global': '/path/to/file'
			}, contexts: {
				'global': '/path/to/file'
			}
		}));
	})

	test('should return contextfile object', () => {
		try {
			let asyncapi = contextService.read();
			expect(asyncapi).toBeTruthy();
			expect(asyncapi).toEqual({ context: { global: 'path/to/file' }, contexts: { global: 'path/to/file' } });
		} catch (error) {

		}
	})

	test('should return contextfile with updated contexts', () => {
		try {
			let context = contextService.addNewContext('notGlobal', '/new/path');
			expect(context).toEqual({
				current: {
					global: '/path/to/file'
				},
				contexts: {
					global: '/path/to/file',
					notGlobal: '/new/path'
				}
			})
		} catch (error) {

		}
	})

	test('should return contextfile with updated current', () => {
		try {
			//@ts-ignore
			let context = contextService.addNewContext('notGlobal', '/new/path');
			let updatedContext = contextService.setCurrent('notGlobal');
			expect(updatedContext).toEqual({
				current: {
					notGlobal: '/new/path'
				},
				contexts: {
					global: '/path/to/file',
					notGlobal: '/new/path'
				}
			})
		} catch (error) {

		}
	})

})