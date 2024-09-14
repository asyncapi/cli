/* eslint-disable @typescript-eslint/no-var-requires */

const fetch = require('node-fetch');
const fs = require('fs');
const unzipper = require('unzipper');
const path = require('path');

const { Parser } = require('@asyncapi/parser/cjs');
const { AvroSchemaParser } = require('@asyncapi/avro-schema-parser');
const { OpenAPISchemaParser } = require('@asyncapi/openapi-schema-parser');
const { RamlDTSchemaParser } = require('@asyncapi/raml-dt-schema-parser');

const parser = new Parser({
  schemaParsers: [
    AvroSchemaParser(),
    OpenAPISchemaParser(),
    RamlDTSchemaParser(),
  ]
});

const SPEC_EXAMPLES_ZIP_URL = 'https://github.com/asyncapi/spec/archive/refs/heads/master.zip';
const EXAMPLE_DIRECTORY = path.join(__dirname, '../assets/examples');
const TEMP_ZIP_NAME = 'spec-examples.zip';

const fetchAsyncAPIExamplesFromExternalURL = () => {
  try {
    return new Promise((resolve, reject) => {
      fetch(SPEC_EXAMPLES_ZIP_URL)
        .then((res) => {
          if (res.status !== 200) {
            reject(new Error(`Failed to fetch examples from ${SPEC_EXAMPLES_ZIP_URL}`));
          }
          const file = fs.createWriteStream(TEMP_ZIP_NAME);
          res.body.pipe(file);
          file.on('close', () => {
            console.log('Fetched ZIP file');
            file.close();
            resolve();
          }).on('error', (err) => {
            reject(err);
          });
        })
        .catch(reject); 
    });
  } catch (error) {
    console.error(error);
  }
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
        console.log('Unzipped all examples from ZIP');
        resolve();
      }).on('error', (error) => {
        reject(new Error(`Error in unzipping from ZIP: ${error.message}`));
      });
  });
};

const buildCLIListFromExamples = async () => {
  const files = fs.readdirSync(EXAMPLE_DIRECTORY);
  const examples = files.filter(file => file.includes('.yml')).sort();

  const buildExampleList = examples.map(async example => {
    const examplePath = path.join(EXAMPLE_DIRECTORY, example);
    const exampleContent = fs.readFileSync(examplePath, { encoding: 'utf-8' });

    try {
      const { document } = await parser.parse(exampleContent);
      // Failed for some reason to parse this spec file (document is undefined), ignore for now
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
      console.error(error);
    }
  });

  const exampleList = (await Promise.all(buildExampleList)).filter(item => !!item);
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

const tidyUp = async () => {
  fs.unlinkSync(TEMP_ZIP_NAME);
};

(async () => {
  await fetchAsyncAPIExamplesFromExternalURL();
  await unzipAsyncAPIExamples();
  await buildCLIListFromExamples();
  await tidyUp();
})();
