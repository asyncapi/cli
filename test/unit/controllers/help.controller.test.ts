import request from 'supertest';
import { expect } from 'chai';

import './setup.test';
import { App } from '../../../src/apps/api/app';
import { HelpController } from '../../../src/apps/api/controllers/help.controller';

describe('HelpController', () => {
  describe('[GET] /help', () => {
    it('should return list of available commands when no command specified', async () => {
      const app = new App([new HelpController()]);
      await app.init();

      const response = await request(app.getServer())
        .get('/v1/help/')
        .expect(200);

      expect(response.body).to.be.an('array');
      // Each item should have command and url properties
      if (response.body.length > 0) {
        expect(response.body[0]).to.have.property('command');
        expect(response.body[0]).to.have.property('url');
      }
    });

    it('should return help for a specific valid command', async () => {
      const app = new App([new HelpController()]);
      await app.init();

      const response = await request(app.getServer())
        .get('/v1/help/validate')
        .expect(200);

      expect(response.body).to.have.property('command');
      expect(response.body).to.have.property('method');
      expect(response.body.method).to.equal('POST');
    });

    it('should return 404 for invalid command', async () => {
      const app = new App([new HelpController()]);
      await app.init();

      return request(app.getServer())
        .get('/v1/help/nonexistent-command')
        .expect(404);
    });

    it('should return help for nested command paths', async () => {
      const app = new App([new HelpController()]);
      await app.init();

      // The diff endpoint exists
      const response = await request(app.getServer())
        .get('/v1/help/diff')
        .expect(200);

      expect(response.body).to.have.property('command');
    });
  });
});
