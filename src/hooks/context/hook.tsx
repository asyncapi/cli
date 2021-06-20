import { useState, useEffect } from 'react';
import os from 'os';
import path from 'path'
import fs from 'fs';


export const useContextFile = () => {
	let [loading, setLoading] = useState(false);
	let [context, setContext] = useState({}) as any;
	const contextFilePath = path.resolve(os.homedir(), '.asyncapi')
	const readContextFile = () => {
		const contextFilePath = path.resolve(os.homedir(), '.asyncapi');
		if (fs.existsSync(contextFilePath)) {
			setLoading(true);
			let contextFile = fs.readFileSync(contextFilePath, 'utf-8');
			setContext(contextFile);
			setLoading(false);
		} else {
			setLoading(true);
			setContext({ current: {}, list: {} })
			setLoading(false);
		}
	}

	const setContextFile = (key: string, spec: string) => {
		let newContext = context;
		newContext.list[key] = spec;
		setLoading(true)
		fs.writeFileSync(contextFilePath, JSON.stringify(newContext), { encoding: 'utf-8' });
		setContext(newContext);
		setLoading(false);
	}

	useEffect(() => {
		readContextFile()
	}, []);

	return {
		loading,
		context,
		setContextFile
	}
}