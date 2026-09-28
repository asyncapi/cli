import { expect } from 'chai';
import { parsePortFlag } from '../../../src/utils/port';
import { ApplicationError } from '../../../src/errors/application-error';

describe('parsePortFlag()', () => {
  it('returns 0 (OS-assigned) when the flag is omitted', () => {
    expect(parsePortFlag(undefined)).to.equal(0);
    expect(parsePortFlag('')).to.equal(0);
  });

  it('parses valid ports', () => {
    expect(parsePortFlag('0')).to.equal(0);
    expect(parsePortFlag('3210')).to.equal(3210);
    expect(parsePortFlag('65535')).to.equal(65535);
  });

  for (const value of ['abc', '12.5', '-1', '65536', '80abc']) {
    it(`rejects "${value}" with CLI_INTEGER_INVALID`, () => {
      try {
        parsePortFlag(value);
        expect.fail('expected parsePortFlag to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(ApplicationError);
        expect((error as ApplicationError).code).to.equal('CLI_INTEGER_INVALID');
        expect((error as ApplicationError).exitCode).to.equal(51);
      }
    });
  }
});
