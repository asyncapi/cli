import { test } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import { fileCleanup } from '../../testHelper';

const spec = `asyncapi: 2.5.0
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signups
channels:
  user/signedup:
    subscribe:
      message:
        $ref: '#/components/messages/UserSignedUp'
  user/loggedOut:
    subcribe:
      message:
        $ref: '#/components/messages/UserLoggedOut'
components:
  messages:
    UserSignedUp:
      payload:
        type: object
        properties:
          displayName:
            type: string
            description: Name of the user
          email:
            type: string
            format: email
            description: Email of the user
    UserLoggedOut:
      payload:
        type: object
        properties:
          displayName:
            type: string
            description: Name of the user
          userId:
            type: string
            description: Id the user
          timestamp:
            type: number
            descriptio: Time stamp when the user logged out

`;

function validateGeneratedSpec(filePath, spec) {
  const generatedSPec = fs.readFileSync(path.resolve(filePath), { encoding: 'utf-8' });
  return generatedSPec === spec;
}

describe('bundle', () => {
  test
    .stdout()
    .command([
      'bundle', './test/commands/bundle/asyncapi.yaml',
      '--output=./test/commands/bundle/final.yaml',
    ])
    .it('should successfully bundle specification', (ctx, done) => {
      expect(ctx.stdout).toContain(
        'Check out your shiny new bundled files at ./test/commands/bundle/final.yaml'
      );
      fileCleanup('./test/commands/bundle/final.yaml');
      done();
    });

  test
    .stderr()
    .command([
      'bundle', './test/commands/bundle/asyncapi.yml'
    ])
    .it('should throw error message if the file path is wrong', (ctx, done) => {
      expect(ctx.stderr).toContain('error loading AsyncAPI document from file: ./test/commands/bundle/asyncapi.yml file does not exist.\n');
      done();
    });

  test
    .stdout()
    .command([
      'bundle', './test/commands/bundle/asyncapi.yaml', '--reference-into-components', '--output=test/commands/bundle/final.yaml'
    ])
    .it('should be able to refence messages into components', (ctx, done) => {
      expect(ctx.stdout).toContain('Check out your shiny new bundled files at test/commands/bundle/final.yaml\n');
      fileCleanup('./test/commands/bundle/final.yaml');
      done();
    });

  test
    .stdout()
    .command([
      'bundle', './test/commands/bundle/asyncapi.yaml', './test/commands/bundle/spec.yaml', '--reference-into-components', '--output=test/commands/bundle/final.yaml'
    ])
    .it('should be able to bundle multiple specs along with custom reference', (ctx, done) => {
      expect(ctx.stdout).toContain('Check out your shiny new bundled files at test/commands/bundle/final.yaml\n');
      expect(validateGeneratedSpec('test/commands/bundle/final.yaml', spec));
      fileCleanup('./test/commands/bundle/final.yaml');
      done();
    });

    test
      .stdout()
      .command([
        'bundle', './test/commands/bundle/asyncapi.yaml', './test/commands/bundle/spec.yaml', '--reference-into-components', '--output=test/commands/bundle/final.yaml', '--base=./test/commands/bundle/asyncapi.yaml'
      ])
      .it('should be able to bundle correctly with overwriting base file', (ctx, done) => {
        expect(ctx.stdout).toContain('Check out your shiny new bundled files at test/commands/bundle/final.yaml\n')
        expect(validateGeneratedSpec('test/commands/bundle/final.yaml', spec));
        fileCleanup('./test/commands/bundle/final.yaml');
        done()
      })
});
