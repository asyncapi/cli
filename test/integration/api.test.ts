// api.test.js
import { expect, test } from '@oclif/test';
import supertest from 'supertest';
import { App } from '../../src/adapters/api/app';
import { PingController } from '../../src/adapters/api/controllers/ping.controller';
import { GeneratorController } from '../../src/adapters/api/controllers/generator.controller';

const apiUrl = 'http://localhost:3001/v1';
let server: any;
let api: any;

describe('API Tests', () => {
  before(async() => {
    api = new App([
      new PingController(),
      new GeneratorController()
    ], 3001);
    await api.init();
    server = api.listen();
  });
  after(() => {
    server.close();
  });
  describe('/ping', () => {
    test
      .it('should return 200 for /ping', async (ctx, done) => {
        const response = await supertest(apiUrl).get('/ping');
        console.log(`response: ${JSON.stringify(response)}`);
        expect(response.status).to.equal(200);
        done();
      });
  });
});
