import React, { useEffect, useState } from 'react';
import { Newline, Text } from 'ink';

//import { useSpecfile } from '../../hooks/context';
import { UseValidateResponse } from '../../hooks/validation/models';
import { useValidate } from '../../hooks/validation';
import { Options } from '../../CliModels';
import { loadSpecFileForValidate } from '../../utils/spec-loader';

interface ValidateInput {
	options: Options,
  parameter?: string | undefined
}

const Validate: React.FunctionComponent<ValidateInput> = ({ options, parameter }) => {
  //const { specFile, error } = useSpecfile({ context: options.context, file: options.file });
  const {specFile, error} = loadSpecFileForValidate(parameter);
  if (error) {
    return <Text color="red">{error}</Text>;
  }

  if (!specFile) {
    return <Text />;
  }

  const validationInput = {
    file: specFile,
    watchMode: options.watch,
  };

  const [result, setResult] = useState<UseValidateResponse>();

  const renderResultFromValidationResponse = (response: UseValidateResponse | undefined) => {
    if (response) {
      if (response.success) {
        return (
          <Text color={'green'}>{response.message}</Text>
        );
      } 
      return response.errors.map((error, index) => (
        <Text key={index}>
          <Text color={'red'}>{error}</Text>
          <Newline />
        </Text>
      ));
    }
    return null;
  };

  useEffect(() => {
    useValidate().validate(validationInput).then(setResult);
  }, []);

  return (
    <Text>{renderResultFromValidationResponse(result)}</Text>
  );
};

export default Validate;
