import { AsyncAPIDocument } from '@interfaces';

declare module 'express' {
  export interface Request {
    asyncapi?: {
      parsedDocument?: AsyncAPIDocument;
      parsedDocuments?: Array<AsyncAPIDocument>;
      validationResults?: Array<ValidationResult>;
      validationResult?: ValidationResult;
    };
  }
}
