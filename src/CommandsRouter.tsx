import React from "react";
import Validate from "./components/Validate/Validate";
import Help from "./components/Help/Help";
import { CliInput } from "./CliModels";


const commandsDictionary = (cliInput: CliInput) => ({
  ['help']: <Help message={cliInput.helpMessage}/>,
  ['validate']: <Validate options={cliInput.options}/>,
});

export const commandsRouter = (cli: any) => {
  const cliInput = CliInput.createFromMeow(cli);
  // @ts-ignore
  return commandsDictionary(cliInput)[cliInput.command];
};
