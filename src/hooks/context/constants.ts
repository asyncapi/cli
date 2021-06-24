import * as os from 'os';
import * as path from 'path';

export const CONTEXTFILE_PATH = path.resolve(os.homedir(), '.asyncapi');
export const ALLOWED_SPECFILE_NAME = [
	'asyncapi.yml',
	'asyncapi.yaml',
	'ayncapi.json'
];