import React, { FC } from 'react';
import { Text } from 'ink';

interface CliOptions {
	file: string;
	watch: boolean;
}

function getColorFrom(watch: boolean) {
	return watch ? 'green' : 'red';
}

function watchModeText(watch: boolean) {
	return watch ? 'Enabled' : 'Disabled';
}

const App: FC<CliOptions> = ({ file = '', watch }) => (
	<Text>
		<Text color="green">{file}</Text> with watchMode <Text color={getColorFrom(watch)}>{watchModeText(watch)}</Text>
	</Text>
);

module.exports = App;
export default App;
