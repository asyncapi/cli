import request from 'supertest';
import { expect } from 'chai';

import './setup.test';
import { App } from '../../../src/apps/api/app';
import { VersionController } from '../../../src/apps/api/controllers/version.controller';

describe('VersionController', () => {
  describe('[GET] /version', () => {
    it('should return version information', async () => {
      const app = new App([new VersionController()]);
      await app.init();

      const response = await request(app.getServer())
        .get('/v1/version')
        .expect(200);

      expect(response.body).to.have.property('version');
      expect(response.body).to.have.property('name');
      expect(response.body).to.have.property('runtime');
      expect(response.body.runtime).to.have.property('node');
      expect(response.body.runtime).to.have.property('platform');
      expect(response.body.runtime).to.have.property('arch');
      expect(response.body.runtime).to.have.property('uptime');
      expect(response.body).to.have.property('api');
      expect(response.body.api).to.have.property('health', 'ok');
    });

    it('should return repository information', async () => {
      const app = new App([new VersionController()]);
      await app.init();

      const response = await request(app.getServer())
        .get('/v1/version')
        .expect(200);

      expect(response.body).to.have.property('repository');
      expect(response.body.repository).to.have.property('url');
      expect(response.body.repository).to.have.property('license');
    });

    it('should include correct Node.js version', async () => {
      const app = new App([new VersionController()]);
      await app.init();

      const response = await request(app.getServer())
        .get('/v1/version')
        .expect(200);

      expect(response.body.runtime.node).to.equal(process.version);
    });
  });
});
