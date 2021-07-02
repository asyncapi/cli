import React from "react";
import Validate from "./components/Validate/Validate";
import { ListContexts, ShowCurrentContext, SetCurrent, AddContext } from './components/Context';
import { CliInput, Router, createCommandDictionary } from "./CliModels";

// //@ts-ignore
// const commandsDictionary = (cliInput: CliInput) => ({
//   ['validate']: <Validate options={cliInput.options} />,
//   ['context']: <Context options={cliInput.options} args={cliInput.arguments} />
// });

export const commandsRouter = (cli: any) => {
  //@ts-ignore
  const cliInput = CliInput.createFromMeow(cli);
  let router = Router.createFromMeow(cli);
  return createCommandDictionary(router, (router: Router) => ({
    ['validate']: <Validate options={router.options} />,
    ['context']: createCommandDictionary(router, (router: Router) => ({
      ['list']: <ListContexts />,
      ['current']: <ShowCurrentContext />,
      ['use']: <SetCurrent options={router.options} args={router.inputs} />,
      ['add']: <AddContext options={router.options} args={router.inputs} />
    }))
  }))
};
