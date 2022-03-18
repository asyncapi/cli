import Command from '../base';
import { Flags } from '@oclif/core';
import { load } from '../models/SpecificationFile';
import { outputFlag } from '../flags';
import path from 'path'; 
import fs from 'fs';
// @ts-ignore
import yaml from 'js-yaml';
// @ts-ignore
import bundler from '@asyncapi/bundler';

export default class Bundle extends Command {
    static description = 'It enables users to bundle/merge specification into one';

    static flags={
      help: Flags.help({char: 'h'}),
      output: outputFlag,
    };
    
    // To input multiple files by disabling argument validation
    static strict = false;

    async run() {
      const {argv,flags} = await this.parse(Bundle);
      const specFiles = await loadSpecFilesfromFilePaths(argv);
      const documents = await bundler(specFiles);
        
      // checking if output flag is passed or not as output flag is treated as object
      if (Object.keys(flags).length === 0 && flags.constructor === Object) {
        this.log(documents.yml());
      } else {
        const outputFileLocation = flags['output'];
        const outputFileExtension = path.extname(`${outputFileLocation}`);
    
        if (outputFileExtension ==='.yaml' || outputFileExtension ==='.yml') {
          fs.writeFile(`${outputFileLocation}`, yaml.dump(documents.yml()),'utf8', (err) => {
            if (err) {
              this.error(err);
            }
          });
        } else if (outputFileExtension ==='.json') {
          fs.writeFile(`${outputFileLocation}`, JSON.stringify((documents.json()),null,2),'utf8',(err) => {
            if (err) {
              this.error(err);
            }
          });
        } else if (outputFileExtension === '.txt') {
          fs.writeFile(`${outputFileLocation}`, (documents.string()),'utf8', (err) => {
            if (err) {
              this.error(err);
            }
          });
        } else {
          this.error('Output file must be yaml,json or txt');
        }
      }
    } 
}

// utility function to return an array of loaded files from their file paths.
async function loadSpecFilesfromFilePaths(filePaths:string[]) {
  const specFilesPromises = filePaths.map(async filePath => {
    const specFile = await load(filePath); 
    return specFile.text();
  }); 
  return await Promise.all(specFilesPromises);
} 
