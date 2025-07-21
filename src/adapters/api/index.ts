import { ValidateController } from './controllers/validate.controller';
import { ParseController } from './controllers/parse.controller';
// import { GenerateController } from './controllers/generate.controller';
import { ConvertController } from './controllers/convert.controller';
import { BundleController } from './controllers/bundle.controller';
import { DiffController } from './controllers/diff.controller';
import { DocsController } from './controllers/docs.controller';
import { HelpController } from './controllers/help.controller';

export const CONTROLLERS = [
  new ValidateController(),
  new ParseController(),
  // new GenerateController(),
  new ConvertController(),
  new BundleController(),
  new DiffController(),
  new DocsController(),
  new HelpController(),
];
