import { expect } from 'chai';
import { Specification } from '../../../src/domains/models/SpecificationFile.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('Specification', function() {
  this.timeout(10000);
  
  describe('fromFile', () => {
    let tempDir: string;
    
    beforeEach(async () => {
      // Create a temporary directory structure for testing
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'spec-test-'));
    });
    
    afterEach(async () => {
      // Clean up the temporary directory
      await fs.rm(tempDir, { recursive: true, force: true });
    });
    
    it('should convert relative filepath to absolute path', async () => {
      // Create a test AsyncAPI file in the temp directory
      const asyncapiContent = JSON.stringify({
        asyncapi: '2.6.0',
        info: { title: 'Test', version: '1.0.0' },
        channels: {}
      });
      
      const testFile = path.join(tempDir, 'asyncapi.json');
      await fs.writeFile(testFile, asyncapiContent);
      
      // Change to temp directory and use relative path
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const spec = await Specification.fromFile('./asyncapi.json');
        
        // The stored filepath should be absolute
        expect(spec.getSource()).to.equal(testFile);
      } finally {
        process.chdir(originalCwd);
      }
    });
    
    it('should correctly handle subdirectory paths', async () => {
      // Create a subdirectory structure
      const subDir = path.join(tempDir, 'src', 'contract');
      await fs.mkdir(subDir, { recursive: true });
      
      // Create the main AsyncAPI file
      const mainFile = path.join(subDir, 'asyncapi.yaml');
      await fs.writeFile(mainFile, `asyncapi: '2.6.0'
info:
  title: Test API
  version: '1.0.0'
channels:
  user/signup:
    publish:
      message:
        $ref: './schemas/user-signup.yaml'
`);
      
      // Create the referenced schema file
      const schemaFile = path.join(subDir, 'schemas', 'user-signup.yaml');
      await fs.mkdir(path.dirname(schemaFile), { recursive: true });
      await fs.writeFile(schemaFile, `name: UserSignup
payload:
  type: object
  properties:
    userId:
      type: string
`);
      
      // Change to temp directory and use relative path
      const originalCwd = process.cwd();
      process.chdir(tempDir);
      
      try {
        const spec = await Specification.fromFile('./src/contract/asyncapi.yaml');
        
        // The stored filepath should be absolute
        const source = spec.getSource();
        expect(source).to.equal(mainFile);
        expect(path.isAbsolute(source)).to.be.true;
      } finally {
        process.chdir(originalCwd);
      }
    });
    
    it('should accept absolute paths', async () => {
      // Create a test AsyncAPI file
      const asyncapiContent = JSON.stringify({
        asyncapi: '2.6.0',
        info: { title: 'Test', version: '1.0.0' },
        channels: {}
      });
      
      const testFile = path.join(tempDir, 'asyncapi.json');
      await fs.writeFile(testFile, asyncapiContent);
      
      // Use absolute path directly
      const spec = await Specification.fromFile(testFile);
      
      // The stored filepath should be the same absolute path
      expect(spec.getSource()).to.equal(testFile);
    });
    
    it('should throw error for non-existent file', async () => {
      try {
        await Specification.fromFile('/non/existent/path/asyncapi.yaml');
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.include('Could not load');
      }
    });
  });
});
