/* eslint-disable sonarjs/no-identical-functions */

import path from 'path';
import { test } from '@oclif/test';
import { NO_CONTEXTS_SAVED } from '../../src/errors/context-error';
import TestHelper, {createMockServer, stopMockServer } from '../helpers';
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
        expect(ctx.stdout).to.contain('File ./test/fixtures/specification.yml is valid but has (itself and/or referenced documents) governance issues.\n');
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/fixtures/specification-avro.yml'])
      .it('works when file path is passed and schema is avro', (ctx, done) => {
        expect(ctx.stdout).to.contain('File ./test/fixtures/specification-avro.yml is valid but has (itself and/or referenced documents) governance issues.\n');
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
        expect(ctx.stdout).to.contain('URL http://localhost:8080/dummySpec.yml is valid but has (itself and/or referenced documents) governance issues.\n');
        expect(ctx.stderr).to.equal('');
        done();
      });
    test
      .stderr()
      .stdout()
      .command(['validate', 'http://localhost:8080/dummySpec.yml --proxyHost=host --proxyPort=8080'])
      .it('should throw error when url is passed with proxyHost and proxyPort with invalid host ', (ctx, done) => {
        expect(ctx.stdout).to.contain('');
        expect(ctx.stderr).to.equal('error loading AsyncAPI document from url: Failed to download http://localhost:8080/dummySpec.yml --proxyHost=host --proxyPort=8080.\n');
        done();
      });

    test
      .stderr()
      .stdout()
      .command(['validate', './test/fixtures/valid-specification-latest.yml'])
      .it('works when file path is passed', (ctx, done) => {
        expect(ctx.stdout).to.include('File ./test/fixtures/valid-specification-latest.yml is valid! File ./test/fixtures/valid-specification-latest.yml and referenced documents don\'t have governance issues.');
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
        expect(ctx.stdout).to.contain('File ./test/fixtures/specification.yml is valid but has (itself and/or referenced documents) governance issues.\n');
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
        expect(ctx.stdout).to.include('\nFile ./test/fixtures/valid-specification-latest.yml is valid! File ./test/fixtures/valid-specification-latest.yml and referenced documents don\'t have governance issues.');
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
        expect(ctx.stderr).to.contain('File ./test/fixtures/specification.yml and/or referenced documents have governance issues.');
        expect(process.exitCode).to.equal(1);
        done();
      });
  });
  
  describe('with --score flag',() => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    test
      .stdout()
      .command(['validate', './test/fixtures/asyncapiTestingScore.yml', '--score'])
      .it('work with --score flag', (ctx, done) => {
        expect(ctx.stdout).to.contains('The score of the asyncapi document is 100\n');
        expect(ctx.stdout).to.contains('File ./test/fixtures/asyncapiTestingScore.yml is valid! File ./test/fixtures/asyncapiTestingScore.yml and referenced documents don\'t have governance issues.');
        done();
      });
  });

  describe('validate command and suppression of the single warning', () => {
    test
      .stdout()
      .command([
        'validate',
        path.join('test', 'fixtures', 'asyncapi_v1.yml'),
        '--suppressWarnings',
        'asyncapi-id'
      ])
      .it('should suppress specified warnings and still validate correctly', (ctx, done) => {
        expect(ctx.stdout).to.include('asyncapi_v1.yml');
        expect(ctx.stdout).to.match(/is valid/i); // General validity check
        expect(ctx.stdout).to.not.include('asyncapi-id'); // Ensure warning is suppressed
        done();
      });
  });
  describe('validate command and suppression of multiple warnings', () => {
    test
      .stdout()
      .command([
        'validate',
        path.join('test', 'fixtures', 'asyncapi_v1.yml'),
        '--suppressWarnings',
        'asyncapi-id',
        'suppressWarnings',
        'asyncapi2-tags'
      ])
      .it('should suppress multiple specified warnings and still validate correctly', (ctx, done) => {
        expect(ctx.stdout).to.not.include('asyncapi-id'); // Suppressed warning #1
        expect(ctx.stdout).to.not.include('asyncapi2-tags'); // Suppressed warning #2
        done();
      });
  });

  describe('validate command without suppression', () => {
    test
      .stdout()
      .command([
        'validate',
        path.join('test', 'fixtures', 'asyncapi_v1.yml'),
      ])
      .it('should include the asyncapi-id warning when not suppressed', (ctx, done) => {
        expect(ctx.stdout).to.include('asyncapi-id'); // Should show up if not suppressed
        done();
      });
  });
  describe('validate command with an invalid suppression rule', () => {
    test
      .stdout()
      .command([
        'validate',
        path.join('test', 'fixtures', 'asyncapi_v1.yml'),
        '--suppressWarnings',
        'non-existing-rule'
      ])
      .it('should not suppress anything', (ctx, done) => {
        expect(ctx.stdout).to.include('asyncapi-id'); 
        done();
      });
  });
  describe('validate command with mixed valid and invalid suppressed warnings', () => {
    test
      .stdout()
      .command([
        'validate',
        path.join('test', 'fixtures', 'asyncapi_v1.yml'),
        '--suppressWarnings',
        'asyncapi-id',
        '--suppressWarnings',
        'foobar'
      ])
      .it('should suppress valid rules', (ctx, done) => {
        expect(ctx.stdout).to.not.include('asyncapi-id'); 
        done();
      });
  });

  describe('with --save-output flag', () => {
    beforeEach(() => {
      testHelper.createDummyContextFile();
    });

    afterEach(() => {
      testHelper.deleteDummyContextFile();
    });

    test
      .stderr()
      .stdout()
      .command([
        'validate',
        './test/fixtures/specification.yml',
        '--log-diagnostics',
        '--save-output=./test/fixtures/validate-output-stylish.txt'
      ])
      .finally(async () => {
        const fs = await import('fs');
        try {
          await fs.promises.unlink('./test/fixtures/validate-output-stylish.txt');
        } catch (err) {
          // Ignore error if file doesn't exist
        }
      })
      .it('should save diagnostics output to file with default stylish format', async (ctx) => {
        const fs = await import('fs');
        expect(ctx.stdout).to.contain('Diagnostics saved to ./test/fixtures/validate-output-stylish.txt');
        expect(ctx.stdout).to.contain('File ./test/fixtures/specification.yml is valid but has (itself and/or referenced documents) governance issues.');
        
        // Verify file was created and has content
        const fileContent = await fs.promises.readFile('./test/fixtures/validate-output-stylish.txt', 'utf8');
        expect(fileContent.length).to.be.greaterThan(0);
        expect(fileContent).to.include('test/fixtures/specification.yml');
      });

    test
      .stderr()
      .stdout()
      .command([
        'validate',
        './test/fixtures/specification.yml',
        '--log-diagnostics',
        '--diagnostics-format=json',
        '--save-output=./test/fixtures/validate-output.json'
      ])
      .finally(async () => {
        const fs = await import('fs');
        try {
          await fs.promises.unlink('./test/fixtures/validate-output.json');
        } catch (err) {
          // Ignore error if file doesn't exist
        }
      })
      .it('should save diagnostics output to file with JSON format', async (ctx) => {
        const fs = await import('fs');
        expect(ctx.stdout).to.contain('Diagnostics saved to ./test/fixtures/validate-output.json');
        expect(ctx.stdout).to.contain('File ./test/fixtures/specification.yml is valid but has (itself and/or referenced documents) governance issues.');
        
        // Verify file was created and has valid JSON content
        const fileContent = await fs.promises.readFile('./test/fixtures/validate-output.json', 'utf8');
        expect(fileContent.length).to.be.greaterThan(0);
        const jsonContent = JSON.parse(fileContent);
        expect(jsonContent).to.be.an('array');
        expect(jsonContent.length).to.be.greaterThan(0);
        expect(jsonContent[0]).to.have.property('code');
        expect(jsonContent[0]).to.have.property('message');
        expect(jsonContent[0]).to.have.property('path');
        expect(jsonContent[0]).to.have.property('severity');
      });

    test
      .stderr()
      .stdout()
      .command([
        'validate',
        './test/fixtures/specification.yml',
        '--log-diagnostics',
        '--diagnostics-format=text',
        '--save-output=./test/fixtures/validate-output.txt'
      ])
      .finally(async () => {
        const fs = await import('fs');
        try {
          await fs.promises.unlink('./test/fixtures/validate-output.txt');
        } catch (err) {
          // Ignore error if file doesn't exist
        }
      })
      .it('should save diagnostics output to file with text format', async (ctx) => {
        const fs = await import('fs');
        expect(ctx.stdout).to.contain('Diagnostics saved to ./test/fixtures/validate-output.txt');
        expect(ctx.stdout).to.contain('File ./test/fixtures/specification.yml is valid but has (itself and/or referenced documents) governance issues.');
        
        // Verify file was created and has content
        const fileContent = await fs.promises.readFile('./test/fixtures/validate-output.txt', 'utf8');
        expect(fileContent.length).to.be.greaterThan(0);
        expect(fileContent).to.include('test/fixtures/specification.yml');
      });

    test
      .stderr()
      .stdout()
      .command([
        'validate',
        './test/fixtures/specification.yml',
        '--log-diagnostics',
        '--diagnostics-format=html',
        '--save-output=./test/fixtures/validate-output.html'
      ])
      .finally(async () => {
        const fs = await import('fs');
        try {
          await fs.promises.unlink('./test/fixtures/validate-output.html');
        } catch (err) {
          // Ignore error if file doesn't exist
        }
      })
      .it('should save diagnostics output to file with HTML format', async (ctx) => {
        const fs = await import('fs');
        expect(ctx.stdout).to.contain('Diagnostics saved to ./test/fixtures/validate-output.html');
        expect(ctx.stdout).to.contain('File ./test/fixtures/specification.yml is valid but has (itself and/or referenced documents) governance issues.');
        
        // Verify file was created and has HTML content
        const fileContent = await fs.promises.readFile('./test/fixtures/validate-output.html', 'utf8');
        expect(fileContent.length).to.be.greaterThan(0);
        expect(fileContent).to.include('<');
        expect(fileContent).to.include('>');
      });

    test
      .stderr()
      .stdout()
      .command([
        'validate',
        './test/fixtures/valid-specification-latest.yml',
        '--log-diagnostics',
        '--save-output=./test/fixtures/validate-output-valid.txt'
      ])
      .finally(async () => {
        const fs = await import('fs');
        try {
          await fs.promises.unlink('./test/fixtures/validate-output-valid.txt');
        } catch (err) {
          // Ignore error if file doesn't exist
        }
      })
      .it('should save empty diagnostics when document has no issues', async (ctx) => {
        const fs = await import('fs');
        expect(ctx.stdout).to.contain('Diagnostics saved to ./test/fixtures/validate-output-valid.txt');
        expect(ctx.stdout).to.include('File ./test/fixtures/valid-specification-latest.yml is valid!');
        
        // Verify file was created
        const fileContent = await fs.promises.readFile('./test/fixtures/validate-output-valid.txt', 'utf8');
        expect(fileContent.length).to.be.equal(0);
      });

    test
      .stderr()
      .stdout()
      .command([
        'validate',
        './test/fixtures/specification.yml',
        '--log-diagnostics',
        '--diagnostics-format=junit',
        '--save-output=./test/fixtures/validate-output.xml'
      ])
      .finally(async () => {
        const fs = await import('fs');
        try {
          await fs.promises.unlink('./test/fixtures/validate-output.xml');
        } catch (err) {
          // Ignore error if file doesn't exist
        }
      })
      .it('should save diagnostics output to file with JUnit format', async (ctx) => {
        const fs = await import('fs');
        expect(ctx.stdout).to.contain('Diagnostics saved to ./test/fixtures/validate-output.xml');
        expect(ctx.stdout).to.contain('File ./test/fixtures/specification.yml is valid but has (itself and/or referenced documents) governance issues.');
        
        // Verify file was created and has XML content
        const fileContent = await fs.promises.readFile('./test/fixtures/validate-output.xml', 'utf8');
        expect(fileContent.length).to.be.greaterThan(0);
        expect(fileContent).to.include('<?xml');
        expect(fileContent).to.include('<testsuites');
      });

    test
      .stderr()
      .stdout()
      .command([
        'validate',
        './test/fixtures/specification.yml',
        '--log-diagnostics',
        '--save-output=./test/fixtures/validate-output-with-suppression.txt',
        '--suppressWarnings=asyncapi-id'
      ])
      .finally(async () => {
        const fs = await import('fs');
        try {
          await fs.promises.unlink('./test/fixtures/validate-output-with-suppression.txt');
        } catch (err) {
          // Ignore error if file doesn't exist
        }
      })
      .it('should save diagnostics with suppressed warnings to file', async (ctx) => {
        const fs = await import('fs');
        expect(ctx.stdout).to.contain('Diagnostics saved to ./test/fixtures/validate-output-with-suppression.txt');
        
        // Verify file was created and does not contain suppressed warning
        const fileContent = await fs.promises.readFile('./test/fixtures/validate-output-with-suppression.txt', 'utf8');
        expect(fileContent.length).to.be.greaterThan(0);
        expect(fileContent).to.not.include('asyncapi-id');
      });

    test
      .stderr()
      .stdout()
      .command([
        'validate',
        './test/fixtures/specification.yml',
        '--log-diagnostics',
        '--save-output=./test/fixtures/validate-output-fail-severity.txt',
        '--fail-severity=warn'
      ])
      .finally(async () => {
        const fs = await import('fs');
        try {
          await fs.promises.unlink('./test/fixtures/validate-output-fail-severity.txt');
        } catch (err) {
          // Ignore error if file doesn't exist
        }
      })
      .it('should save diagnostics with fail-severity to file', async (ctx) => {
        const fs = await import('fs');
        expect(ctx.stdout).to.contain('Diagnostics saved to ./test/fixtures/validate-output-fail-severity.txt');
        
        // Verify file was created
        const fileContent = await fs.promises.readFile('./test/fixtures/validate-output-fail-severity.txt', 'utf8');
        expect(fileContent.length).to.be.greaterThan(0);
        expect(fileContent).to.include('test/fixtures/specification.yml');
      });
  });
});
