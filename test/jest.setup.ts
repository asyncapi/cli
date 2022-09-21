/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-unused-vars */

declare namespace NodeJS {
  interface Global {
    oclif: any;
  }
}

global.oclif = global.oclif || {};
global.oclif.columns = 80;
