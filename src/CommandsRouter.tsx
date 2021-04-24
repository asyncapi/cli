import React from "react";
import Validate from "./components/Validate/Validate";
import Help from "./components/Help/Help";
import { CliInput, HelpMessage, Options } from "./CliModels";


const commandsDictionary = (options: Options, helpMessage: HelpMessage) => ({
  ['help']: <Help message={helpMessage}/>,
  ['validate']: <Validate options={options}/>,
});

export const commandsRouter = (cli: any) => {
  const cliInput = CliInput.createFromMeow(cli);
  // @ts-ignore
  return commandsDictionary(cliInput.options, cliInput.helpMessage)[cliInput.command];
};
