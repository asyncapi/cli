import React, { FunctionComponent, useEffect, useState } from 'react';
import { Newline, Text } from 'ink';
import { Options } from "../../CliModels";
import { SpecificationFile, useValidate } from "../../hooks/validation";
import { UseValidateResponse } from "../../hooks/validation/models";
import { useSpecfile } from '../../hooks/context';

interface ValidateInput {
	options: Options,
}

const Validate: FunctionComponent<ValidateInput> = ({ options }) => {
	let { specFile, error } = useSpecfile({ context: options.context, file: options.file });
	if (error) {
		return <Text color="red">{error.message}</Text>
	}

	if (!specFile) {
		return <Text />
	}

	const validationInput = {
		file: new SpecificationFile(specFile.getSpecificationName()),
		watchMode: options.watch,
	};

	const [result, setResult] = useState<UseValidateResponse>();

	const renderResultFromValidationResponse = (response: UseValidateResponse | undefined) => {
		if (response) {
			if (response.success) {
				return (
					<Text color={"green"}>{response.message}</Text>
				);
			} else {
				return response.errors.map((error, index) => (
					<Text key={index}>
						<Text color={"red"}>{error}</Text>
						<Newline />
					</Text>
				));
			}
		}
		return null;
	}

	useEffect(() => {
		useValidate().validate(validationInput).then(setResult);
	}, []);

	return (
		<Text>{renderResultFromValidationResponse(result)}</Text>
	)
}

export default Validate;
