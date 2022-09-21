declare module NodeJS  {
  interface Global {
    oclif: any;
  }
}

global.oclif = global.oclif || {};
global.oclif.columns = 80;