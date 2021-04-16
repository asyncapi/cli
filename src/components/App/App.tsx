import React, { FC, useState } from 'react';
import { Newline, Text } from 'ink';
import { SpecificationFile } from "../../hooks/validation";
import { useValidate } from "../../hooks/validation";

interface Context {
	file: string;
	watch: boolean;
}

interface CliOptions {
	isValidateAction?: boolean;
	context: Context;
}

function getColorFrom(watch: boolean) {
	return watch ? 'green' : 'red';
}

function watchModeText(watch: boolean) {
	return watch ? 'Enabled' : 'Disabled';
}

const App: FC<CliOptions> = ({ context: { file, watch } }) => {

	const [result, setResult] = useState();


	const validationInput = {
		file: new SpecificationFile(file),
		watchMode: watch,
	};

	useValidate().validate(validationInput).then(setResult);

	return (
		<Text>
			<Text color="green">{file}</Text> with watchMode <Text color={getColorFrom(watch)}>{watchModeText(watch)}</Text>
			<Newline/>
			<Text>{result}</Text>
		</Text>
	);
}

module.exports = App;
export default App;
