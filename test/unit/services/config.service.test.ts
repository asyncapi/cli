import { expect } from 'chai';
import minimatch from 'minimatch';

describe('ConfigService - Glob Pattern Matching', () => {
  describe('minimatch integration', () => {
    it('should match simple wildcard patterns', () => {
      // Test simple wildcard matching - * doesn't match across path separators, ** does
      expect(minimatch('https://github.com/user/repo', 'https://github.com/*')).to.be.false; // * doesn't match across /
      expect(minimatch('https://github.com/user/repo', 'https://github.com/**')).to.be.true;  // ** matches across /
      expect(minimatch('https://api.example.com/v1/users/123', 'https://api.example.com/**')).to.be.true;
      
      // Test non-matching patterns
      expect(minimatch('https://gitlab.com/user/repo', 'https://github.com/*')).to.be.false;
      expect(minimatch('https://github.com/user/repo', 'https://gitlab.com/*')).to.be.false;
    });

    it('should match complex glob patterns', () => {
      // Test complex pattern with file extension (without fragment)
      expect(minimatch('https://github.com/user/repo/blob/main/file.yaml', 'https://github.com/**/blob/**/*.yaml')).to.be.true;
      
      // Test multi-subdomain pattern
      expect(minimatch('https://api.staging.example.com/v1/data', 'https://api.*.example.com/**')).to.be.true;
      expect(minimatch('https://api.prod.example.com/v1/data', 'https://api.*.example.com/**')).to.be.true;
      
      // Test specific user pattern
      
      // Test non-matching patterns
      expect(minimatch('https://api.example.com/v1/data', 'https://api.*.example.com/**')).to.be.false;
    });

    it('should handle edge cases correctly', () => {
      // Test exact matches
      expect(minimatch('https://github.com/user/repo', 'https://github.com/user/repo')).to.be.true;
      
      // Test patterns with special characters
      expect(minimatch('https://api.example.com/v1/users/123', 'https://api.example.com/v1/users/*')).to.be.true;
      expect(minimatch('https://api.example.com/v1/users/123', 'https://api.example.com/v1/users/**')).to.be.true;
      
      // Test patterns with query parameters and fragments
      expect(minimatch('https://github.com/user/repo?param=value#fragment', 'https://github.com/user/repo*')).to.be.true;
    });

    it('should handle invalid patterns gracefully', () => {
      // Test invalid bracket patterns - minimatch handles them gracefully by returning false
      expect(minimatch('https://github.com/user/repo', 'https://github.com/[invalid-pattern')).to.be.false;
      
      // Test valid patterns that might be confused with invalid ones
      expect(minimatch('https://github.com/user/repo', 'https://github.com/valid/**')).to.be.false;
      expect(minimatch('https://github.com/valid/repo', 'https://github.com/valid/**')).to.be.true;
    });

    it('should demonstrate improved glob support over custom regex', () => {
      // These patterns would be difficult to implement correctly with custom regex
      const testCases = [
        {
          pattern: 'https://api.*.example.com/**',
          url: 'https://api.staging.example.com/v1/data',
          shouldMatch: true
        },
        {
          pattern: 'https://api.*.example.com/**',
          url: 'https://api.prod.example.com/v1/data',
          shouldMatch: true
        },
        {
          pattern: 'https://api.*.example.com/**',
          url: 'https://api.example.com/v1/data',
          shouldMatch: false
        },
        {
          pattern: 'https://github.com/**/blob/**/*.yaml',
          url: 'https://github.com/user/repo/blob/main/file.yaml',
          shouldMatch: true
        },
        {
          pattern: 'https://github.com/**/blob/**/*.yaml',
          url: 'https://github.com/user/repo/blob/main/file.json',
          shouldMatch: false
        }
      ];

      testCases.forEach(({ pattern, url, shouldMatch }) => {
        expect(minimatch(url, pattern)).to.equal(shouldMatch, 
          `Pattern "${pattern}" should ${shouldMatch ? 'match' : 'not match'} URL "${url}"`);
      });
    });
  });
});
