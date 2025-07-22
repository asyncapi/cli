import { Router, Request, Response, NextFunction } from 'express';
import { Controller } from '@/interfaces';
import { ProblemException } from '../exceptions/problem.exception';
import { getAppOpenAPI } from '../../../utils/app-openapi';

const getCommandsFromRequest = (req: Request): string[] => {
  return req.params.command
    ? req.params.command.split('/').filter((cmd) => cmd.trim())
    : [];
};

const isKeyValid = (key: string, obj: any): boolean => {
  return Object.keys(obj).includes(key);
};

const getPathKeysMatchingCommands = (
  commands: string[],
  pathKeys: string[],
): string | undefined => {
  if (
    !Array.isArray(pathKeys) ||
    !pathKeys.every((key) => typeof key === 'string')
  ) {
    return undefined;
  }
  return pathKeys.find((pathKey) => {
    const pathParts = pathKey.split('/').filter((part) => part !== '');
    return pathParts.every((pathPart, i) => {
      const command = commands[Number(i)];
      return pathPart === command || pathPart.startsWith('{');
    });
  });
};

const getFullRequestBodySpec = (operationDetails: any) => {
  return isKeyValid('requestBody', operationDetails)
    ? operationDetails.requestBody.content['application/json'].schema
    : null;
};

const buildResponseObject = (
  matchedPathKey: string,
  method: string,
  operationDetails: any,
  requestBodySchema: any,
) => {
  return {
    command: matchedPathKey,
    method: method.toUpperCase(),
    summary: operationDetails.summary || '',
    requestBody: requestBodySchema,
  };
};

export class HelpController implements Controller {
  public basepath = '/help';

  public async boot(): Promise<Router> {
    const router: Router = Router();

    router.get(
      '/help/:command*?',
      async (req: Request, res: Response, next: NextFunction) => {
        const commands = getCommandsFromRequest(req);
        let openapiSpec: any;

        try {
          openapiSpec = await getAppOpenAPI();
        } catch (err) {
          return next(err);
        }

        if (commands.length === 0) {
          const routes = isKeyValid('paths', openapiSpec)
            ? Object.keys(openapiSpec.paths).map((path) => ({
                command: path.replace(/^\//, ''),
                url: `${this.basepath}${path}`,
              }))
            : [];
          return res.json(routes);
        }

        const pathKeys = isKeyValid('paths', openapiSpec)
          ? Object.keys(openapiSpec.paths)
          : [];
        const matchedPathKey = getPathKeysMatchingCommands(commands, pathKeys);

        if (!matchedPathKey) {
          return next(
            new ProblemException({
              type: 'invalid-asyncapi-command',
              title: 'Invalid AsyncAPI Command',
              status: 404,
              detail: 'The given AsyncAPI command is not valid.',
            }),
          );
        }

        const pathInfo = isKeyValid(matchedPathKey, openapiSpec.paths)
          ? openapiSpec.paths[String(matchedPathKey)]
          : undefined;
        const method = commands.length > 1 ? 'get' : 'post';
        const operationDetails = isKeyValid(method, pathInfo)
          ? pathInfo[String(method)]
          : undefined;
        if (!operationDetails) {
          return next(
            new ProblemException({
              type: 'invalid-asyncapi-command',
              title: 'Invalid AsyncAPI Command',
              status: 404,
              detail: 'The given AsyncAPI command is not valid.',
            }),
          );
        }

        const requestBodySchema = getFullRequestBodySpec(operationDetails);

        return res.json(
          buildResponseObject(
            matchedPathKey,
            method,
            operationDetails,
            requestBodySchema,
          ),
        );
      },
    );

    return router;
  }
}
