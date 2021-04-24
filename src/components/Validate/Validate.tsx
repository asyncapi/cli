import React, { FC } from 'react';
import { Newline, Text } from 'ink';
import { Options } from "../../CliModels";

interface ValidateInput {
	options: Options,
}

const Validate: FC<ValidateInput> = ({ options }) => {
	console.log(options)

	// const [result, setResult] = useState();
	//
	// const validationInput = {
	// 	file: new SpecificationFile(file),
	// 	watchMode: watch,
	// };
	//
	// useValidate().validate(validationInput).then(setResult);

	return (
		<Text>
			<Text>Validation Component</Text>
			<Newline/>
			<Text>With context {options.context}</Text>
			<Newline/>
			<Text>With watchMode {options.watch.toString()}</Text>
		</Text>
	);
}

module.exports = Validate;
export default Validate;
