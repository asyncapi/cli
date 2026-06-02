/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import {
  compileAjv,
  findContentSchema,
} from '../../../src/apps/api/middlewares/validation.middleware';

describe('ValidationMiddleware', () => {
  describe('findContentSchema()', () => {
    it('should return undefined when requestBody is missing or has no content', () => {
      expect(findContentSchema(undefined as any)).to.be.undefined;
      expect(findContentSchema(null as any)).to.be.undefined;
      expect(findContentSchema({})).to.be.undefined;
      expect(findContentSchema({ content: {} })).to.be.undefined;
    });

    it('should return undefined when content types have no schema', () => {
      expect(
        findContentSchema({
          content: {
            'application/json': {},
            'text/plain': {},
          },
        }),
      ).to.be.undefined;
    });

    it('should return schema from application/json', () => {
      const schema = { type: 'object', properties: { name: { type: 'string' } } };
      expect(
        findContentSchema({
          content: {
            'application/json': { schema },
          },
        }),
      ).to.equal(schema);
    });

    it('should fall back to other content types when application/json has no schema', () => {
      const schema = { type: 'object' };
      expect(
        findContentSchema({
          content: {
            'application/json': {},
            'multipart/form-data': { schema },
          },
        }),
      ).to.equal(schema);
    });

    it('should prioritize application/json over other content types', () => {
      const jsonSchema = { type: 'object', properties: { jsonField: { type: 'string' } } };
      const formSchema = { type: 'object', properties: { formField: { type: 'string' } } };

      expect(
        findContentSchema({
          content: {
            'multipart/form-data': { schema: formSchema },
            'application/json': { schema: jsonSchema },
          },
        }),
      ).to.equal(jsonSchema);
    });
  });

  describe('compileAjv()', () => {
    it('should return undefined for GET endpoints without a request body', async () => {
      const validate = await compileAjv({
        path: '/version',
        method: 'get',
      });

      expect(validate).to.be.undefined;
    });

    it('should return a validator for POST endpoints with a JSON request body', async () => {
      const validate = await compileAjv({
        path: '/validate',
        method: 'post',
        documents: ['asyncapi'],
      });

      expect(validate).to.be.a('function');
    });

    it('should return a validator for all API POST endpoints with request bodies', async () => {
      const endpoints: Array<{ path: string; documents?: string[] }> = [
        { path: '/validate', documents: ['asyncapi'] },
        { path: '/parse', documents: ['asyncapi'] },
        { path: '/generate', documents: ['asyncapi'] },
        { path: '/convert', documents: ['source'] },
        { path: '/bundle', documents: ['asyncapis', 'base'] },
        { path: '/diff', documents: ['asyncapis'] },
      ];

      for (const { path, documents } of endpoints) {
        const validate = await compileAjv({
          path,
          method: 'post',
          documents,
        });

        expect(validate, `expected validator for ${path}`).to.be.a('function');
      }
    });
  });
});
