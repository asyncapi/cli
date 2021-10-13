import { injectable } from 'tsyringe';
import { SpecificationFile } from '../models';
import parser from '@asyncapi/parser';
import { ValidationError } from '../errors/validation-error';
import { ValidationMessage } from '../messages';
import * as fs from 'fs';
import * as path from 'path';
import { Context, ContextService } from '../config/context';
import { ContextNotFound, MissingContextFileError, MissingCurrentContextError } from '../errors/context-error';

@injectable()
export class ValidationService {
  async validate(file: SpecificationFile) {
    if (file.isNotValid()) {
      throw new ValidationError({
        type: 'invalid-file',
        filepath: file.getSpecificationName()
      });
    }
    try {
      await parser.parse(file.read());
      return ValidationMessage(file.getSpecificationName()).message();
    } catch (error) {
      throw new ValidationError({
        type: 'parser-error',
        err: error
      });
    }
  }
}

type argumentType = 'file-path' | 'context-name';

@injectable()
export class SpecFileLoader {
  private context: Context | undefined
  constructor(
    private contextService: ContextService
  ) {
    this.context = contextService.context;
  }
  private readonly allowedFileNames: string[] = [
    'asyncapi.json',
    'asyncapi.yml',
    'asyncapi.yaml'
  ];

  load(argument: string | undefined): SpecificationFile {
    if (argument) {
      if (this.isType(argument) === 'context-name') {
        return this.loadSpecfileFromContextStore(argument);
      }
      return new SpecificationFile(argument);
    }

    if (this.context) {
      if (!this.context.current) {
        throw new MissingCurrentContextError();
      }
      return new SpecificationFile(this.context.getContext(this.context.current));
    }

    const autoDetectedSpecFile = this.detectSpecFile();
    if (autoDetectedSpecFile) {
      return new SpecificationFile(autoDetectedSpecFile);
    }

    throw new ValidationError({ type: 'no-spec-found' });
  }

  private detectSpecFile(): string | undefined {
    return this.allowedFileNames.find(filename => fs.existsSync(path.resolve(process.cwd(), filename)));
  }

  private loadSpecfileFromContextStore(contextname: string): SpecificationFile {
    if (!this.context) {
      throw new MissingContextFileError();
    }
    if (!this.context.getContext(contextname)) {
      throw new ContextNotFound(contextname);
    }
    return new SpecificationFile(this.context.getContext(contextname));
  }

  private isType(specpathOrcontextname: string): argumentType {
    const specPath = new SpecificationFile(specpathOrcontextname);
    if (specpathOrcontextname.startsWith('.') || !specPath.isNotValid()) { return 'file-path'; }
    return 'context-name';
  }
}
