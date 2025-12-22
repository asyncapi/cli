import { Router, Request, Response, NextFunction } from 'express';
import { Controller } from '@/interfaces';
import { ProblemException } from '../exceptions/problem.exception';
import { getAppOpenAPI } from '../../../utils/app-openapi';

const getCommandsFromRequest = (req: Request): string[] => {
  const param = req.params.command ?? req.params[0] ?? '';
  if (Array.isArray(param)) {
    return param.filter((cmd: string) => cmd.trim());
  }
  return param.split('/').filter((cmd: string) => cmd.trim());
};

const getPathKeysMatchingCommands = (
  commands: string[],
  pathKeys: string[],
): string | undefined => {
  const exactPath = `/${commands.join('/')}`;
  if (pathKeys.includes(exactPath)) {
    return exactPath;
  }

  return pathKeys.find((pathKey) => {
    const pathParts = pathKey.split('/').filter((part) => part !== '');
    if (pathParts.length !== commands.length) {
      return false;
    }
    return pathParts.every((pathPart, i) =>
      pathPart === commands[i] || pathPart.startsWith('{') || pathPart.startsWith(':')
    );
  });
};

const getFullRequestBodySpec = (operationDetails: any) => {
  const schema = operationDetails?.requestBody?.content?.['application/json']?.schema ?? null;
  if (!schema) {
    return null;
  }
  const seen = new WeakSet();
  return JSON.parse(JSON.stringify(schema, (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  }));
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

    const helpHandler = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const openapiSpec = await getAppOpenAPI();
        const paths = openapiSpec?.paths ?? {};
        const pathKeys = Object.keys(paths);
        const commands = getCommandsFromRequest(req);

        if (commands.length === 0) {
          return res.json(pathKeys.map((path) => ({
            command: path.replace(/^\//, ''),
            url: `${this.basepath}${path}`,
          })));
        }

        const matchedPathKey = getPathKeysMatchingCommands(commands, pathKeys);

        if (!matchedPathKey) {
          return next(new ProblemException({
            type: 'invalid-asyncapi-command',
            title: 'Invalid AsyncAPI Command',
            status: 404,
            detail: 'The given AsyncAPI command is not valid.',
          }));
        }

        const pathInfo = paths[matchedPathKey];
        const method = pathInfo.get ? 'get' : 'post';
        const operationDetails = pathInfo[method];

        if (!operationDetails) {
          return next(new ProblemException({
            type: 'invalid-asyncapi-command',
            title: 'Invalid AsyncAPI Command',
            status: 404,
            detail: 'The given AsyncAPI command is not valid.',
          }));
        }

        const requestBodySchema = getFullRequestBodySpec(operationDetails);

        return res.json(buildResponseObject(matchedPathKey, method, operationDetails, requestBodySchema));
      } catch (err) {
        return next(err);
      }
    };

    router.get(this.basepath, async (_req: Request, res: Response, next: NextFunction) => {
      try {
        const openapiSpec = await getAppOpenAPI();
        const paths = Object.keys(openapiSpec?.paths ?? {});
        return res.json(paths.map(path => ({
          command: path.replace(/^\//, ''),
          url: `${this.basepath}${path}`,
        })));
      } catch (err) {
        return next(err);
      }
    });

    router.get(`${this.basepath}{/*command}`, helpHandler);

    return router;
  }
}
