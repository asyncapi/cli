/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const unzipper = require('unzipper');
const path = require('path');

const { Parser } = require('@asyncapi/parser/cjs');
const { AvroSchemaParser } = require('@asyncapi/avro-schema-parser');
const { OpenAPISchemaParser } = require('@asyncapi/openapi-schema-parser');
const { RamlDTSchemaParser } = require('@asyncapi/raml-dt-schema-parser');
const { pipeline } = require('stream');
const { promisify } = require('util');

const streamPipeline = promisify(pipeline);

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

const shouldSkipFetching = (options = {}) => {
  const force = options.force ?? (
    process.argv.includes('--force') ||
    process.argv.includes('-f') ||
    process.env.FORCE_FETCH_EXAMPLES === 'true'
  );
  if (force) {
    return false;
  }

  const exampleDirectory = options.exampleDirectory || EXAMPLE_DIRECTORY;
  const examplesJsonPath = options.examplesJsonPath || path.join(exampleDirectory, 'examples.json');

  if (!fs.existsSync(examplesJsonPath) || !fs.existsSync(exampleDirectory)) {
    return false;
  }

  try {
    const content = fs.readFileSync(examplesJsonPath, { encoding: 'utf-8' });
    const examples = JSON.parse(content);
    if (!Array.isArray(examples) || examples.length === 0) {
      return false;
    }

    const files = fs.readdirSync(exampleDirectory);
    const hasYamlFiles = files.some(file => file.endsWith('.yml') || file.endsWith('.yaml'));
    return hasYamlFiles;
  } catch (error) {
    return false;
  }
};

const fetchAsyncAPIExamplesFromExternalURL = () => {
  try {
    return new Promise((resolve, reject) => {
      fetch(SPEC_EXAMPLES_ZIP_URL)
        .then(async (res) => {
          if (res.status !== 200) {
            return reject(new Error(`Failed to fetch examples from ${SPEC_EXAMPLES_ZIP_URL}`));
          }

          const file = fs.createWriteStream(TEMP_ZIP_NAME);
          await streamPipeline(res.body, file);

          console.log('Fetched ZIP file');
          resolve();
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
  if (fs.existsSync(TEMP_ZIP_NAME)) {
    fs.unlinkSync(TEMP_ZIP_NAME);
  }
};

const main = async (options = {}) => {
  if (shouldSkipFetching(options)) {
    console.log('AsyncAPI examples already exist. Skipping fetch (use --force or -f to re-fetch).');
    return;
  }

  await fetchAsyncAPIExamplesFromExternalURL();
  await unzipAsyncAPIExamples();
  await buildCLIListFromExamples();
  await tidyUp();
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  shouldSkipFetching,
  main,
  fetchAsyncAPIExamplesFromExternalURL,
  unzipAsyncAPIExamples,
  buildCLIListFromExamples,
  listAllProtocolsForFile,
  tidyUp,
  EXAMPLE_DIRECTORY,
  SPEC_EXAMPLES_ZIP_URL,
};
