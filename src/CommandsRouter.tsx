import React from "react";
import Validate from "./components/Validate/Validate";
import { CliInput } from "./CliModels";


const commandsDictionary = (cliInput: CliInput) => ({
  ['validate']: <Validate options={cliInput.options}/>,
});

export const commandsRouter = (cli: any) => {
  const cliInput = CliInput.createFromMeow(cli);
  // @ts-ignore
  return commandsDictionary(cliInput)[cliInput.command];
};
