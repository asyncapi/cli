/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable security/detect-non-literal-fs-filename */
import { injectable } from 'tsyringe';
import { Context, ContextFileNotFoundError,KeyNotFoundError, SpecFileNotFoundError } from './models';
import { CONTEXTFILE_PATH } from '../../constants';
import * as fs from 'fs';
import * as path from 'path';
import { SpecificationFile } from '../validation';

@injectable()
export class ContextService {
  loadContextFile(): Context {
    if (!fs.existsSync(CONTEXTFILE_PATH)) {throw new ContextFileNotFoundError();}
    return JSON.parse(fs.readFileSync(CONTEXTFILE_PATH, 'utf-8')) as Context;
  }

  deleteContextFile(): void {
    if (fs.existsSync(CONTEXTFILE_PATH)) {fs.unlinkSync(CONTEXTFILE_PATH);}
  }

  save(context: Context): void {
    fs.writeFileSync(CONTEXTFILE_PATH, JSON.stringify(context), { encoding: 'utf-8' });
  }

  autoDetectSpecFile(): string | undefined {
    const allowedSpecFileNames = ['asyncapi.yml', 'asyncapi.yaml', 'asyncapi.json'];
    return allowedSpecFileNames.find(specName => fs.existsSync(path.resolve(process.cwd(), specName)));
  }

  addContext(context: Context, key: string, specFile: SpecificationFile): Context {
    if (specFile.isNotValid()) {throw new SpecFileNotFoundError();}
    context.store[key] = specFile.getSpecificationName();
    return context;
  }

  deleteContext(context: Context, key: string): Context {
    //@ts-ignore
    if (context.current === key) {delete context.current;} 
    delete context.store[key];
    return context;
  }

  updateCurrent(context: Context, key: string): Context {
    if (!context.store[key]) {throw new KeyNotFoundError();} 
    context.current = key;
    return context;
  }
}
