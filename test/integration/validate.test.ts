/* eslint-disable sonarjs/no-identical-functions */

import path from 'path';
import { test } from '@oclif/test';
import { NO_CONTEXTS_SAVED } from '../../src/errors/context-error';
import TestHelper, { createMockServer, stopMockServer } from '../helpers';
import { expect } from '@oclif/test';

const testHelper = new TestHelper();

describe('validate', () => {
  describe('with file paths', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    before(() => {
      createMockServer();
    });

    after(() => {
      stopMockServer();
    });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/fixtures/specification.yml'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).to.match(/File .\/test\/fixtures\/specification.yml is valid but has \(itself and\/or referenced documents\) governance issues.\n\ntest\/fixtures\/specification.yml/);
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/fixtures/specification-avro.yml'])
      .it('works when file path is passed and schema is avro', (ctx, done) => {
        expect(ctx.stdout).to.match(/File .\/test\/fixtures\/specification-avro.yml is valid but has \(itself and\/or referenced documents\) governance issues.\n/);
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/fixtures/not-found.yml'])
      .it('should throw error if file path is wrong', (ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal('error loading AsyncAPI document from file: ./test/fixtures/not-found.yml file does not exist.\n');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['validate', 'http://localhost:8080/dummySpec.yml'])
      .it('works when url is passed', (ctx, done) => {
        expect(ctx.stdout).to.match(/URL http:\/\/localhost:8080\/dummySpec.yml is valid but has \(itself and\/or referenced documents\) governance issues.\n\nhttp:\/\/localhost:8080\/dummySpec.yml/);
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/fixtures/valid-specification-latest.yml'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).to.match(/File .\/test\/fixtures\/valid-specification.yml is valid! File .\/test\/fixtures\/valid-specification.yml and referenced documents don't have governance issues./);
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with context names', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    test
      .stderr()
      .stdout()
      .command(['validate', 'code'])
      .it('validates if context name exists', (ctx, done) => {
        const fileName = path.resolve(__dirname, '../fixtures/specification.yml');
        expect(ctx.stdout).to.include(`File ${fileName} is valid but has (itself and/or referenced documents) governance issues.`);
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['validate', 'non-existing-context'])
      .it('throws error if context name is not saved', (ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal('ContextError: Context "non-existing-context" does not exist.\n');
        done();
      });
  });

  describe('with no arguments', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.setCurrentContext('home');
      testHelper.deleteDummyContextFile();
    });
    
    test
      .stderr()
      .stdout()
      .command(['validate'])
      .it('validates from current context', (ctx, done) => {
        const fileName = path.resolve(__dirname, '../../test/fixtures/specification.yml');
        expect(ctx.stdout).to.includes(`File ${fileName} is valid but has (itself and/or referenced documents) governance issues`);
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .do(() => {
        testHelper.unsetCurrentContext();
        testHelper.createDummyContextFile();
      })
      .command(['validate'])
      .it('throws error message if no current context', (ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal('ContextError: No context is set as current, please set a current context.\n');
        done();
      });
  });

  describe('with no context file', () => {
    beforeEach(() => {
      try {
        testHelper.deleteDummyContextFile();
      } catch (e: any) {
        if (e.code !== 'ENOENT') {
          throw e;
        }
      }
    });

    test
      .stderr()
      .stdout()
      .command(['validate'])
      .it('throws error message if no context file exists', (ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal(`error locating AsyncAPI document: ${NO_CONTEXTS_SAVED}\n`);
        done();
      });
  });

  describe('with --log-diagnostics flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/fixtures/specification.yml', '--log-diagnostics'])
      .it('works with --log-diagnostics', (ctx, done) => {
        expect(ctx.stdout).to.match(/File .\/test\/fixtures\/specification.yml is valid but has \(itself and\/or referenced documents\) governance issues.\n\ntest\/fixtures\/specification.yml/);
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/fixtures/specification.yml', '--no-log-diagnostics'])
      .it('works with --no-log-diagnostics', (ctx, done) => {
        expect(ctx.stdout).to.equal('');
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with --diagnostics-format flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/fixtures/specification.yml', '--diagnostics-format=text'])
      .it('works with --diagnostics-format flag (with governance issues)', (ctx, done) => {
        expect(ctx.stdout).to.match(new RegExp('File ./test/fixtures/specification.yml is valid but has \\(itself and\\/or referenced documents\\) governance issues.\\ntest\\/fixtures\\/specification.yml:1:1'));
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/fixtures/valid-specification-latest.yml', '--diagnostics-format=text'])
      .it('works with --diagnostics-format flag (without governance issues)', (ctx, done) => {
        expect(ctx.stdout).to.match(new RegExp('File ./test/fixtures/valid-specification.yml is valid! File ./test/fixtures/valid-specification.yml and referenced documents don\'t have governance issues.'));
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('with --fail-severity flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/fixtures/specification.yml', '--fail-severity=warn'])
      .it('works with --fail-severity', (ctx, done) => {
        expect(ctx.stderr).to.match(new RegExp('File ./test/fixtures/specification.yml and\\/or referenced documents have governance issues.\\n\\ntest\\/fixtures\\/specification.yml'));
        done();
      });
  });
});
