import React, { useEffect, useState } from 'react';
import { Newline, Text } from 'ink';

import { loadSpecFileForValidation } from '../../hooks/context';
import { UseValidateResponse } from '../../hooks/validation/models';
import { useValidate } from '../../hooks/validation';
import { Options } from '../../CliModels';

interface ValidateInput {
	options: Options,
  parameter?: string | undefined
}

const Validate: React.FunctionComponent<ValidateInput> = ({ options, parameter }) => {
  const {specFile, error} = loadSpecFileForValidation(parameter);

  if (error) {
    return <Text color="red">{error.message}</Text>;
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
