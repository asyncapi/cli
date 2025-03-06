import fs from 'fs';
import path from 'path';
import { fileCleanup } from '../../helpers';
import { describe, beforeEach, afterEach, it } from 'mocha';
import { expect } from 'chai';
import { runCommand } from '@oclif/test';


const spec = fs.readFileSync('./test/integration/bundle/final-asyncapi.yaml', {encoding: 'utf-8'});

function validateGeneratedSpec(filePath: string, spec: string) {
  const generatedSPec = fs.readFileSync(path.resolve(filePath), { encoding: 'utf-8' });
  return generatedSPec === spec;
}

describe('bundle', () => {
  describe('bundle successful', () => {
    it('should successfully bundle specification', async () => {
      const { stdout } = await runCommand([
        'bundle', './test/integration/bundle/first-asyncapi.yaml',
        '--output=./test/integration/bundle/final.yaml',
      ]);
      expect(stdout).to.contain(
        'Check out your shiny new bundled files at ./test/integration/bundle/final.yaml'
      );
      fileCleanup('./test/integration/bundle/final.yaml');
    });
  });

  describe('bundle into json file', () => {
    it('should successfully bundle specification into json file', async () => {
      const { stdout } = await runCommand([
        'bundle', './test/integration/bundle/first-asyncapi.yaml',
        '--output=./test/integration/bundle/final.json'
      ]);
      expect(stdout).to.contain(
        'Check out your shiny new bundled files at ./test/integration/bundle/final.json'
      );
      fileCleanup('./test/integration/bundle/final.json');
    });
  });
      

  describe('when file path is wrong', () => {
    it('should throw error message if the file path is wrong', async () => {
      const { stderr } = await runCommand([
        'bundle', './test/integration/bundle/asyncapi.yml'
      ]);
      expect(stderr).to.contain('Error: ENOENT: no such file or directory');
    });
  });
      

  describe('with custom reference', () => {
    it('should be able to bundle multiple specs along with custom reference', async () => {
      const { stdout } = await runCommand([
        'bundle', './test/integration/bundle/first-asyncapi.yaml', './test/integration/bundle/feature.yaml', '--output=test/integration/bundle/final.yaml'
      ]);
      expect(stdout).to.contain('Check out your shiny new bundled files at test/integration/bundle/final.yaml\n');
      expect(validateGeneratedSpec('test/integration/bundle/final.yaml', spec));
      fileCleanup('./test/integration/bundle/final.yaml');
    });
  });
    
      
  describe('with base file', () => {
    it('should be able to bundle correctly with overwriting base file', async () => {
      const { stdout } = await runCommand([
        'bundle', './test/integration/bundle/first-asyncapi.yaml', './test/integration/bundle/feature.yaml', '--output=test/integration/bundle/final.yaml', '--base=./test/integration/bundle/first-asyncapi.yaml'
      ]);
      expect(stdout).to.contain('Check out your shiny new bundled files at test/integration/bundle/final.yaml\n');
      expect(validateGeneratedSpec('test/integration/bundle/final.yaml', spec));
      fileCleanup('./test/integration/bundle/final.yaml');
    });
  });

  describe('with spec v3', () => {
    it('should be able to bundle v3 spec correctly', async () => {
      const { stdout } = await runCommand([
        'bundle', './test/integration/bundle/first-asyncapiv3.yaml', '--output=test/integration/bundle/final.yaml'
      ]);
      expect(stdout).to.contain('Check out your shiny new bundled files at test/integration/bundle/final.yaml\n');
      fileCleanup('./test/integration/bundle/final.yaml');
    });
  });
});


  
