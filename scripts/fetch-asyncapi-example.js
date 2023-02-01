/* eslint-disable @typescript-eslint/no-var-requires */

const request = require('request');
const fs = require('fs');
const unzipper = require('unzipper');
const path = require('path');

const { Parser } = require('@asyncapi/parser/cjs');
const { AvroSchemaParser } = require('@asyncapi/parser/cjs/schema-parser/avro-schema-parser');
const { OpenAPISchemaParser } = require('@asyncapi/parser/cjs/schema-parser/openapi-schema-parser');
const { RamlSchemaParser } = require('@asyncapi/parser/cjs/schema-parser/raml-schema-parser');

const parser = new Parser({
  schemaParsers: [
    AvroSchemaParser(),
    OpenAPISchemaParser(),
    RamlSchemaParser(),
  ]
});

const SPEC_EXAMPLES_ZIP_URL = 'https://github.com/asyncapi/spec/archive/refs/heads/master.zip';
const EXAMPLE_DIRECTORY = path.join(__dirname, '../assets/examples');
const TEMP_ZIP_NAME = 'spec-examples.zip';

const fetchAsyncAPIExamplesFromExternalURL = () => {
  return new Promise((resolve, reject) => {
    request(SPEC_EXAMPLES_ZIP_URL)
      .pipe(fs.createWriteStream(TEMP_ZIP_NAME))
      .on('close', () => {
        console.log('Fetched ZIP file');
        resolve();
      }).on('error', reject);
  });
};

const unzipAsyncAPIExamples = async () => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(EXAMPLE_DIRECTORY)) {
      fs.mkdirSync(EXAMPLE_DIRECTORY);
    }

    fs.createReadStream(TEMP_ZIP_NAME)
      .pipe(unzipper.Parse())
      .on('entry', async (entry) => {
        const fileName = entry.path;
        if (fileName.includes('examples/') && fileName.includes('.yml') && entry.type === 'File') {
          const fileContent = await entry.buffer();
          const fileNameWithExtension = fileName.split('examples/')[1];
          fs.writeFileSync(path.join(EXAMPLE_DIRECTORY, fileNameWithExtension), fileContent.toString());
        } else {
          entry.autodrain();
        }
      }).on('close', () => {
        console.log('Unzipped all examples from zip');
        resolve();
      }).on('error', () => {
        reject();
      });
  });
};

const buildCLIListFromExamples = async () => {
  const files = fs.readdirSync(EXAMPLE_DIRECTORY);
  const examples = files.filter(file => file.includes('.yml')).sort();

  const buildExampleList = examples.map(async example => {
    const examplePath = path.join(EXAMPLE_DIRECTORY, example);
    const exampleContent = fs.readFileSync(examplePath, { encoding: 'utf-8'});
    
    try {
      const { document } = await parser.parse(exampleContent);
      // Failed for somereason to parse this spec file (document is undefined), ignore for now
      if (!document) {
        return;
      }

      const title = document.info().title();
      const protocols = listAllProtocolsForFile(document);
      return {
        name: protocols ? `${title} - (protocols: ${protocols})` : title,
        value: example
      };
    } catch (error) {
      // Failed for somereason to parse this spec file, ignore for now
      console.error(error);
    }
  });

  const exampleList = await Promise.all(buildExampleList);
  const orderedExampleList = exampleList.sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(path.join(EXAMPLE_DIRECTORY, 'examples.json'), JSON.stringify(orderedExampleList, null, 4));
};

const listAllProtocolsForFile = (document) => {
  const servers = document.servers();
  if (servers.length === 0) {
    return '';
  }

  return servers.all().map(server => server.protocol()).join(',');
};

const tidyup = async () => {
  fs.unlinkSync(TEMP_ZIP_NAME);
};

const main = async () => {
  await fetchAsyncAPIExamplesFromExternalURL();
  await unzipAsyncAPIExamples();
  await buildCLIListFromExamples();
  await tidyup();
};

main();

