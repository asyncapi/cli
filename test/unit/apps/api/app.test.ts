import { expect } from 'chai';
import { createServer } from 'node:http';
import { App } from '../../../../src/apps/api/app';
import { ApplicationError } from '../../../../src/errors/application-error';
import { CLI_ERROR_CODES } from '../../../../src/errors/error-codes';

describe('API App startup', () => {
  it('resolves after listening with the actual ephemeral port', async () => {
    const startup = await new App([], 0).listen(true);

    try {
      expect(startup.server.listening).to.equal(true);
      expect(startup.host).to.be.a('string');
      expect(startup.port).to.be.a('number').and.to.be.greaterThan(0);
      expect(startup.url).to.equal(`http://localhost:${startup.port}`);
    } finally {
      await new Promise<void>((resolve, reject) => {
        startup.server.close((error) => error ? reject(error) : resolve());
      });
    }
  });

  it('rejects an occupied port with SERVER_PORT_IN_USE', async () => {
    const occupied = createServer();
    await new Promise<void>((resolve) => occupied.listen(0, resolve));
    const address = occupied.address();
    const port = address && typeof address === 'object' ? address.port : 0;

    try {
      await new App([], port).listen(true);
      expect.fail('Expected startup to reject');
    } catch (error) {
      expect(error).to.be.instanceOf(ApplicationError);
      expect((error as ApplicationError).code).to.equal(
        CLI_ERROR_CODES.SERVER_PORT_IN_USE,
      );
      expect((error as ApplicationError).details).to.deep.equal({ port });
    } finally {
      await new Promise<void>((resolve, reject) => {
        occupied.close((error) => error ? reject(error) : resolve());
      });
    }
  });
});
