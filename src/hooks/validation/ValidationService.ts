import { injectable } from "tsyringe";
import { SpecificationFile, ValidationResponse } from "./models";

const parser = require('@asyncapi/parser');

@injectable()
export class ValidationService {

  constructor() {}

  execute(file: SpecificationFile): ValidationResponse {
    return new Promise(((resolve, reject) => {
      parser.parse(file.read())
        .then(() => resolve('The definition file is correct!!'))
        .catch((err: any) => {
          if (err.detail) {
            reject(err.detail);
          } else {
            reject(err.validationErrors.map((e: any) => `${e.title} ${e.location.startLine}:${e.location.startColumn}`));
          }
        });
    }));
  }


//   constructor(props) {
//     super(props);
//   }
//
// }
// const useValidate = (myService = new service()) => {
//   const [message, setMessage] = React.useState('')
//   setMessage(myService.sayHello())
//   return {
//     validate: () => {myService.sayHello()}
//   }
}
