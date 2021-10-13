import * as fs from 'fs';
import * as path from 'path';

interface Specification {
  isNotValid(): boolean;
  read():string;
  getSpecificationName(): string;
}

export class SpecificationFile implements Specification {
  private readonly name: string;

  constructor(name: string) {
    const localDirectory = process.cwd();
    this.name = path.resolve(localDirectory, name);
  }

  isNotValid(): boolean {
    return !fs.existsSync(this.name) || !fs.lstatSync(this.name).isFile();
  }

  read(): string {
    return fs.readFileSync(this.name, 'utf8');
  }

  getSpecificationName(): string {
    return this.name;
  }
}
