import * as fs from 'fs';
import * as path from 'path';

export class SpecificationFile {
  private readonly name: string;

  constructor(name: string) {
    const localDirectory = process.cwd();
    this.name = path.join(localDirectory, name);
  }

  isNotValid(): boolean {
    return !fs.existsSync(this.name) || !fs.lstatSync(this.name).isFile();
  }

  read(): string {
    return fs.readFileSync(this.name).toString();
  }

  getFileName(): string {
    return this.name;
  }
}

export type WatchFlag = boolean;

export type ValidationResponse = Promise<any>

export interface ValidationInput {
  file: SpecificationFile;
  watchMode: WatchFlag;
}
