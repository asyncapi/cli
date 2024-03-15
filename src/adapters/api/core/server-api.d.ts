import { OldAsyncAPIDocument as AsyncAPIDocument } from '@asyncapi/parser';

declare module 'express' {
  export interface Request {
    asyncapi?: {
      parsedDocument?: AsyncAPIDocument;
      parsedDocuments?: Array<AsyncAPIDocument>;
    },
  }
}
