import React from "react";
import Validate from "./components/Validate/Validate";
import { Context, List } from './components/Context';
import { CliInput, Router, createCommandDictionary } from "./CliModels";

//@ts-ignore
const commandsDictionary = (cliInput: CliInput) => ({
  ['validate']: <Validate options={cliInput.options} />,
  ['context']: <Context options={cliInput.options} args={cliInput.arguments} />
});

export const commandsRouter = (cli: any) => {
  //@ts-ignore
  const cliInput = CliInput.createFromMeow(cli);
  let router = Router.createFromMeow(cli);
  // @ts-ignore
  return createCommandDictionary(router, (router: Router) => ({
    ['validate']: <Validate options={router.options} />,
    //@ts-ignore
    ['context']: createCommandDictionary(router, (router: Router) => ({
      ['list']: <List />
    }))
  }))
};
