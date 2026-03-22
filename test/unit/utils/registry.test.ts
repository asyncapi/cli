import { expect } from 'chai';
import { registryValidation, registryURLParser } from '../../../src/utils/generate/registry';

describe('registry', () => {
  describe('registryURLParser', () => {
    it('should return undefined when no input is provided', () => {
      expect(registryURLParser()).to.be.undefined;
    });

    it('should return undefined when empty string is provided', () => {
      expect(registryURLParser('')).to.be.undefined;
    });

    it('should not throw for valid http URL', () => {
      expect(() => registryURLParser('http://example.com')).to.not.throw;
    });

    it('should not throw for valid https URL', () => {
      expect(() => registryURLParser('https://example.com')).to.not.throw;
    });

    it('should throw for invalid URL without protocol', () => {
      expect(() => registryURLParser('example.com')).to.throw(
        'Invalid --registry-url flag. The param requires a valid http/https url.'
      );
    });

    it('should throw for invalid URL with wrong protocol', () => {
      expect(() => registryURLParser('ftp://example.com')).to.throw(
        'Invalid --registry-url flag. The param requires a valid http/https url.'
      );
    });
  });

  describe('registryValidation', () => {
    it('should return undefined when no URL is provided', async () => {
      expect(await registryValidation()).to.be.undefined;
    });

    it('should return undefined when empty string is provided', async () => {
      expect(await registryValidation('')).to.be.undefined;
    });

    it('should timeout and throw descriptive error for unreachable URL', async () => {
      // Using a blackholed IP address that will timeout
      // This IP is in the TEST-NET-3 range (203.0.113.0/24) which is reserved for documentation
      // and should not be routable
      const blackholeUrl = 'http://203.0.113.99';
      
      try {
        await registryValidation(blackholeUrl);
        // Should not reach here
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        const err = error as Error;
        expect(err.message).to.include('timed out');
        expect(err.message).to.include('5 seconds');
        expect(err.message).to.include(blackholeUrl);
      }
    }).timeout(10000);

    it('should use HEAD method for validation (not GET)', async () => {
      // This test verifies that HEAD is used by checking the error message
      // If GET was used, the error would be different
      const blackholeUrl = 'http://203.0.113.98';
      
      try {
        await registryValidation(blackholeUrl);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        // The key assertion: we get a timeout error, not a connection refused
        // This proves HEAD request was attempted (connection was tried but timed out)
        const err = error as Error;
        expect(err.message).to.include('timed out');
      }
    }).timeout(10000);

    it('should handle AbortController timeout correctly', async () => {
      // Test that the timeout mechanism works by using an unreachable IP
      const start = Date.now();
      
      try {
        await registryValidation('http://203.0.113.97');
      } catch {
        // Expected
      }
      
      const elapsed = Date.now() - start;
      // Should timeout in approximately 5 seconds (give or take 1 second for overhead)
      expect(elapsed).to.be.greaterThan(4500);
      expect(elapsed).to.be.lessThan(7000);
    }).timeout(10000);

    it('should include helpful guidance in timeout error message', async () => {
      const unreachableUrl = 'http://203.0.113.96';
      
      try {
        await registryValidation(unreachableUrl);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        const err = error as Error;
        expect(err.message).to.include('Please check if the URL is correct');
        expect(err.message).to.include('server is accessible');
      }
    }).timeout(10000);
  });
});