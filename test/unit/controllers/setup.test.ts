import { AsyncAPIDocument, ValidationResult } from '../../../src/interfaces/index';

declare module 'express' {
  export interface Request extends Express.Request {
    asyncapi?: {
      parsedDocument?: AsyncAPIDocument;
      parsedDocuments?: Array<AsyncAPIDocument>;
      validationResults?: Array<ValidationResult>;
      validationResult?: ValidationResult;
    };
  }
}
