import { Request, Response, NextFunction } from 'express';

import { ProblemException } from '../exceptions/problem.exception';
import { createAjvInstance } from '../../../utils/ajv';
import { getAppOpenAPI } from '../../../utils/app-openapi';

import type { ValidateFunction } from 'ajv';
import { AsyncAPIDocument } from '@asyncapi/converter';
import { ValidationService } from '@services/validation.service';
import { Specification } from '@/domains/models/SpecificationFile';
import { ParserOptions } from '@asyncapi/parser/cjs/parser';
import { ValidationResult } from '@/interfaces';

export interface ValidationMiddlewareOptions {
  path: string;
  method:
    | 'all'
    | 'get'
    | 'post'
    | 'put'
    | 'delete'
    | 'patch'
    | 'options'
    | 'head';
  documents?: Array<string>;
  version?: 'v1';
  condition?: (req: Request) => boolean;
}

const ajvInstance = createAjvInstance();

/**
 * Find a schema from the request body content types.
 * Prioritizes application/json, but falls back to any content type with a schema.
 */
function findContentSchema(requestBody: {
  content?: Record<string, { schema?: unknown }>;
}): unknown | undefined {
  const content = requestBody?.content;
  if (!content) {
    return undefined;
  }

  if (content['application/json']?.schema) {
    return content['application/json'].schema;
  }

  for (const contentType of Object.keys(content)) {
    if (content[contentType]?.schema) {
      return content[contentType].schema;
    }
  }

  return undefined;
}

/**
 * Create AJV's validator function for given path in the OpenAPI document.
 */
async function compileAjv(
  options: ValidationMiddlewareOptions,
): Promise<ValidateFunction | undefined> {
  const appOpenAPI = await getAppOpenAPI();
  const paths = appOpenAPI.paths || {};

  const pathName = options.path;
  const path = paths[String(pathName)];
  if (!path) {
    throw new Error(
      `Path "${pathName}" doesn't exist in the OpenAPI document.`,
    );
  }

  const methodName = options.method;
  const method = path[String(methodName)];
  if (!method) {
    throw new Error(
      `Method "${methodName}" for "${pathName}" path doesn't exist in the OpenAPI document.`,
    );
  }

  const requestBody = method.requestBody;
  if (!requestBody) {
    return undefined;
  }

  const contentSchema = findContentSchema(requestBody);
  if (!contentSchema || typeof contentSchema !== 'object') {
    return undefined;
  }

  const schema = { ...(contentSchema as Record<string, unknown>) };
  schema['$schema'] = 'http://json-schema.org/draft-07/schema';

  if (options.documents && schema.properties) {
    schema.properties = { ...(schema.properties as Record<string, unknown>) };
    for (const field of options.documents) {
      const property = (schema.properties as Record<string, unknown>)[
        String(field)
      ];
      if (!property || typeof property !== 'object') {
        continue;
      }

      const propertySchema = property as Record<string, unknown>;
      if (propertySchema.items) {
        (schema.properties as Record<string, unknown>)[String(field)] = {
          ...propertySchema,
          items: true,
        };
      } else {
        (schema.properties as Record<string, unknown>)[String(field)] = true;
      }
    }
  }

  return ajvInstance.compile(schema);
}

async function validateRequestBody(validate: ValidateFunction, body: any) {
  const valid = validate(body);
  const errors = validate.errors && [...validate.errors];

  if (valid === false) {
    throw new ProblemException({
      type: 'invalid-request-body',
      title: 'Invalid Request Body',
      status: 422,
      validationErrors: errors as any,
    });
  }
}

async function validateSingleDocument(
  asyncapi: string | AsyncAPIDocument,
  path: string,
  validationService: ValidationService,
) {
  if (typeof asyncapi === 'object') {
    asyncapi = JSON.stringify(asyncapi);
  }

  const specFile = new Specification(asyncapi, { fileURL: path });

  return validationService
    .validateDocument(specFile, {
      'fail-severity': 'error',
      suppressAllWarnings: false,
    })
    .then((result) => {
      if (!result.success || result.data?.status !== 'valid') {
        throw new ProblemException({
          type: 'invalid-asyncapi-document',
          title: 'Invalid AsyncAPI Document',
          status: 422,
          detail: result.error || 'The provided AsyncAPI document is invalid.',
          diagnostics: result.diagnostics || result.data?.diagnostics,
        });
      }
      return result.data;
    });
}

async function validateListDocuments(
  asyncapis: Array<string | AsyncAPIDocument>,
  path: string,
  validationService: ValidationService,
) {
  const validationResults: Array<ValidationResult> = [];
  for (const asyncapi of asyncapis) {
    const parsed = await validateSingleDocument(
      asyncapi,
      path,
      validationService,
    );
    if (parsed) {
      validationResults.push(parsed);
    } else {
      throw new ProblemException({
        type: 'invalid-asyncapi-document',
        title: 'Invalid AsyncAPI Document',
        status: 422,
        detail: 'One or more provided AsyncAPI documents are invalid.',
      });
    }
  }
  return validationResults;
}

/**
 * Validate RequestBody and sent AsyncAPI document(s) for given path and method based on the OpenAPI Document.
 */
export async function validationMiddleware(
  options: ValidationMiddlewareOptions,
) {
  options.version = options.version || 'v1';
  const validate = await compileAjv(options);
  const documents = options.documents || [];

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (validate) {
        await validateRequestBody(validate, req.body);
      }
    } catch (error: unknown) {
      if (error instanceof ProblemException) {
        return next(error);
      }

      // Handle unexpected errors
      return next(
        new ProblemException({
          type: 'internal-server-error',
          title: 'Internal Server Error',
          status: 500,
          detail: `An unexpected error occurred during request validation: ${(error as Error).message ?? 'Unknown error'}`,
        }),
      );
    }

    if (options.condition && !options.condition(req)) {
      return next();
    }

    const parserConfig: ParserOptions = {
      __unstable: {
        resolver: {
          resolvers: [
            // @TODO: Add Cookie Based Resolvers after migration and understanding some
            // details about how to use them in the new parser-js version.
          ],
        },
      },
    };

    const validationService = new ValidationService(parserConfig);
    const resolveURL =
      req.header('x-asyncapi-resolve-url') ||
      req.header('referer') ||
      req.header('origin') ||
      '';

    try {
      req.asyncapi = req.asyncapi || {};
      for (const field of documents) {
        const body = req.body[String(field)];
        if (Array.isArray(body)) {
          const results = await validateListDocuments(
            body,
            resolveURL,
            validationService,
          );
          const parsedDocuments = results.map((result) => result.document);

          if (!parsedDocuments.every(doc => doc !== undefined)) {
            throw new ProblemException({
              type: 'invalid-asyncapi-document-parse',
              title: 'Invalid AsyncAPI Document (Parse Error)',
              status: 422,
              detail: 'One or more provided AsyncAPI documents are invalid.',
              diagnostics: results.flatMap(result => result.diagnostics || []),
            });
          }

          req.asyncapi.parsedDocuments = parsedDocuments;
          req.asyncapi.validationResults = results;
        } else {
          const result = await validateSingleDocument(
            body,
            resolveURL,
            validationService,
          );
          req.asyncapi.parsedDocument = result?.document;
          req.asyncapi.validationResult = result;
        }
      }

      next();
    } catch (err: unknown) {
      return next(err);
    }
  };
}

const TYPES_400 = [
  'null-or-falsey-document',
  'impossible-to-convert-to-json',
  'invalid-document-type',
  'invalid-json',
  'invalid-yaml',
];

/**
 * Some error types have to be treated as 400 HTTP Status Code, another as 422.
 */
function retrieveStatusCode(type: string): number {
  if (TYPES_400.includes(type)) {
    return 400;
  }
  return 422;
}

/**
 * Merges fields from ParserError to ProblemException.
 */
function mergeParserError(
  error: ProblemException,
  parserError: any,
): ProblemException {
  if (parserError.detail) {
    error.set('detail', parserError.detail);
  }
  if (parserError.validationErrors) {
    error.set('validationErrors', parserError.validationErrors);
  }
  if (parserError.parsedJSON) {
    error.set('parsedJSON', parserError.parsedJSON);
  }
  if (parserError.location) {
    error.set('location', parserError.location);
  }
  if (parserError.refs) {
    error.set('refs', parserError.refs);
  }
  return error;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function tryConvertToProblemException(err: any) {
  const typeName = err.type.replace(
    'https://github.com/asyncapi/parser-js/',
    '',
  );
  const error = new ProblemException({
    type: typeName,
    title: err.title,
    status: retrieveStatusCode(typeName),
  });
  mergeParserError(error, err);

  return error;
}

export { compileAjv, findContentSchema };
