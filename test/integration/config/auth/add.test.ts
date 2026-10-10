import { expect, test } from '@oclif/test';

describe('config:auth:add', () => {
  describe('with valid arguments', () => {
    test
      .stdout()
      .stderr()
      .command(['config:auth:add', 'https://github.com/org/**', 'my-token'])
      .it('should add auth config with raw token', (ctx) => {
        expect(ctx.stdout).to.include('Auth config added');
        expect(ctx.stdout).to.include('raw token');
        expect(ctx.stdout).to.include('https://github.com/org/**');
      });

    test
      .stdout()
      .stderr()
      .command(['config:auth:add', 'https://github.com/**', '$GITHUB_TOKEN'])
      .it('should detect env var reference (token starting with $)', (ctx) => {
        expect(ctx.stdout).to.include('env var');
        expect(ctx.stdout).to.include('GITHUB_TOKEN');
      });

    test
      .stdout()
      .stderr()
      .command(['config:auth:add', 'https://api.com/**', 'tok', '-a', 'token'])
      .it('should use custom auth-type', (ctx) => {
        expect(ctx.stdout).to.include('token');
      });

    test
      .stdout()
      .stderr()
      .command([
        'config:auth:add', 'https://api.com/**', 'tok',
        '-h', 'X-Custom=value1',
        '-h', 'Accept=application/json',
      ])
      .it('should parse multiple headers', (ctx) => {
        expect(ctx.stdout).to.include('Headers');
        expect(ctx.stdout).to.include('X-Custom');
      });
  });

  describe('with invalid header format', () => {
    test
      .stdout()
      .stderr()
      .command(['config:auth:add', 'https://api.com/**', 'tok', '-h', 'invalid-no-equals'])
      .it('should warn about invalid header format', (ctx) => {
        expect(ctx.stderr).to.include('Ignored invalid header format');
      });
  });
});
