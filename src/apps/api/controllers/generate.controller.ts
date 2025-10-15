import fs from 'fs';
import path from 'path';
import { NextFunction, Request, Response, Router } from 'express';
import Ajv from 'ajv';

import { Controller, GenerationOptions } from '@/interfaces';

import { validationMiddleware } from '../middlewares/validation.middleware';

import { ArchiverService } from '@services/archiver.service';
import { GeneratorService } from '@services/generator.service';

import { ProblemException } from '../exceptions/problem.exception';
import { Specification } from '@/domains/models/SpecificationFile';

/**
 * Controller which exposes the Generator functionality
 */
export class GenerateController implements Controller {
  public basepath = '/generate';

  private archiverService = new ArchiverService();
  private generatorService = new GeneratorService();
  private ajv: Ajv | undefined;

  private async generate(req: Request, res: Response, next: NextFunction) {
    // try {
    //   await this.validateTemplateParameters(req);
    // } catch (err) {
    //   return next(err);
    // }

    const zip = this.archiverService.createZip(res);

    let tmpDir: string | undefined;
    try {
      tmpDir = await this.archiverService.createTempDirectory();
      const { asyncapi, template, parameters } = req.body;
      const options: GenerationOptions = {
        forceWrite: true,
        templateParams: parameters,
      };

      const generateFunc = req.body['use-fallback-generator']
        ? this.generatorService.generate.bind(this.generatorService)
        : this.generatorService.generateUsingNewGenerator.bind(
          this.generatorService,
        );

      try {
        const result = await generateFunc(
          new Specification(
            typeof asyncapi === 'object' ? JSON.stringify(asyncapi) : asyncapi,
          ),
          template,
          tmpDir,
          options,
          {},
          true,
        );

        if (!result.success) {
          return next(
            new ProblemException({
              type: 'generation-error',
              title: 'Generation Error',
              status: 500,
              detail: result.error || 'An error occurred during generation.',
            }),
          );
        }
      } catch (genErr: unknown) {
        return next(
          new ProblemException({
            type: 'internal-generator-error',
            title: 'Internal Generator error',
            status: 500,
            detail: (genErr as Error).message,
          }),
        );
      }

      this.archiverService.appendDirectory(zip, tmpDir, 'template');
      this.archiverService.appendAsyncAPIDocument(zip, asyncapi);

      res.status(200);
      return await this.archiverService.finalize(zip);
    } catch (err: unknown) {
      return next(
        new ProblemException({
          type: 'internal-server-error',
          title: 'Internal server error',
          status: 500,
          detail: (err as Error).message,
        }),
      );
    } finally {
      if (tmpDir) {
        // Remove the temporary directory after the response is sent
        // to avoid leaving temporary files on the server.
        await this.archiverService.removeTempDirectory(tmpDir);
      }
    }
  }

  private async validateTemplateParameters(req: Request) {
    const { template, parameters } = req.body;

    const validate = await this.getAjvValidator(template);

    if (!validate) {
      throw new ProblemException({
        type: 'invalid-template',
        title: 'Invalid Generator Template',
        status: 422,
        detail: `Template ${template} is not valid or does not exist.`,
      });
    }

    const valid = validate(parameters || {});
    const errors = validate.errors && [...validate.errors];

    if (valid === false) {
      throw new ProblemException({
        type: 'invalid-template-parameters',
        title: 'Invalid Generator Template parameters',
        status: 422,
        validationErrors: errors as any,
      });
    }
  }

  /**
   * Retrieve proper AJV's validator function, create or reuse it.
   */
  public async getAjvValidator(templateName: string) {
    if (!this.ajv) {
      throw new Error('AJV instance is not initialized');
    }

    let validate = this.ajv.getSchema(templateName);
    if (!validate) {
      this.ajv.addSchema(
        (await this.serializeTemplateParameters(templateName)) || {},
        templateName,
      );
      validate = this.ajv.getSchema(templateName);
    }
    return validate;
  }

  /**
   * Serialize template parameters. Read all parameters from template's package.json and create a proper JSON Schema for validating parameters.
   */
  public async serializeTemplateParameters(
    templateName: string,
  ): Promise<object | undefined> {
    const pathToPackageJSON = path.join(
      __dirname,
      `../../../../node_modules/${templateName}/package.json`,
    );
    const packageJSONContent = await fs.promises.readFile(
      pathToPackageJSON,
      'utf-8',
    );
    const packageJSON = JSON.parse(packageJSONContent);
    if (!packageJSON) {
      return;
    }

    const generator = packageJSON.generator;
    if (!generator || !generator.parameters) {
      return;
    }

    const parameters = generator.parameters || {};
    const required: string[] = [];
    for (const parameter in parameters) {
      // at the moment all parameters have to be passed to the Generator instance as string
      parameters[String(parameter)].type = 'string';
      if (parameters[String(parameter)].required) {
        required.push(parameter);
      }
      delete parameters[String(parameter)].required;
    }

    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: parameters,
      required,
      // don't allow non supported properties
      additionalProperties: false,
    };
  }

  public async boot(): Promise<Router> {
    this.ajv = new Ajv({
      inlineRefs: true,
      allErrors: true,
      schemaId: 'id',
      logger: false,
    });
    const router = Router();

    router.post(
      `${this.basepath}`,
      await validationMiddleware({
        path: this.basepath,
        method: 'post',
        documents: ['asyncapi'],
      }),
      this.generate.bind(this),
    );

    return router;
  }
}
