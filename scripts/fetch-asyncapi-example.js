/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('node:fs');
const unzipper = require('unzipper');
const path = require('node:path');

const { Parser } = require('@asyncapi/parser/cjs');
const { AvroSchemaParser } = require('@asyncapi/avro-schema-parser');
const { OpenAPISchemaParser } = require('@asyncapi/openapi-schema-parser');
const { RamlDTSchemaParser } = require('@asyncapi/raml-dt-schema-parser');
const { pipeline } = require('node:stream');
const { promisify } = require('node:util');

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

/**
 * Fetch examples ZIP from AsyncAPI spec repository
 */
const fetchAsyncAPIExamplesFromExternalURL = async () => {
  const res = await fetch(SPEC_EXAMPLES_ZIP_URL);

  if (res.status !== 200) {
    throw new Error(`Failed to fetch examples from ${SPEC_EXAMPLES_ZIP_URL}`);
  }

  const fileStream = fs.createWriteStream(TEMP_ZIP_NAME);
  await streamPipeline(res.body, fileStream);

  console.log('Fetched ZIP file');
};

/**
 * Safely unzip examples while preventing ZIP Slip attacks
 */
const unzipAsyncAPIExamples = async () => {
  if (!fs.existsSync(EXAMPLE_DIRECTORY)) {
    fs.mkdirSync(EXAMPLE_DIRECTORY, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    fs.createReadStream(TEMP_ZIP_NAME)
      .pipe(unzipper.Parse())
      .on('entry', async (entry) => {
        try {
          const rawPath = entry.path;
          const normalizedPath = path.normalize(rawPath);

          // Only allow files inside examples/ directory
          if (
            entry.type === 'File' &&
            normalizedPath.startsWith(`examples${path.sep}`) &&
            normalizedPath.endsWith('.yml')
          ) {
            const safeFileName = path.basename(normalizedPath);
            const outputPath = path.join(EXAMPLE_DIRECTORY, safeFileName);

            // Final safety check to prevent path traversal
            if (!outputPath.startsWith(EXAMPLE_DIRECTORY)) {
              throw new Error(`Path traversal attempt detected: ${rawPath}`);
            }

            const fileContent = await entry.buffer();
            fs.writeFileSync(outputPath, fileContent.toString(), 'utf-8');
          } else {
            entry.autodrain();
          }
        } catch (error) {
          entry.autodrain();
          reject(error);
        }
      })
      .on('close', () => {
        console.log('Unzipped all examples from ZIP');
        resolve();
      })
      .on('error', (error) => {
        reject(new Error(`Error unzipping ZIP: ${error.message}`));
      });
  });
};


/**
 * Build CLI examples list from parsed specs
 */
const buildCLIListFromExamples = async () => {
  const files = fs.readdirSync(EXAMPLE_DIRECTORY);
  const examples = files.filter((file) => file.endsWith('.yml')).sort();

  const exampleEntries = await Promise.all(
    examples.map(async (example) => {
      const examplePath = path.join(EXAMPLE_DIRECTORY, example);
      const exampleContent = fs.readFileSync(examplePath, 'utf-8');

      try {
        const { document } = await parser.parse(exampleContent);
        if (!document) {
          return null;
        }

        const title = document.info().title();
        const protocols = listAllProtocolsForFile(document);

        return {
          name: protocols ? `${title} - (protocols: ${protocols})` : title,
          value: example,
        };
      } catch (error) {
        console.error(error);
        return null;
      }
    })
  );

  const orderedExampleList = exampleEntries
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(
    path.join(EXAMPLE_DIRECTORY, 'examples.json'),
    JSON.stringify(orderedExampleList, null, 2),
    'utf-8'
  );
};

/**
 * List all protocols defined in an AsyncAPI document
 */

const listAllProtocolsForFile = (document) => {
  const servers = document.servers();
  if (servers.length === 0) {
    return '';
  }

  return servers.all().map((server) => server.protocol()).join(',');
};


/**
 * Cleanup temporary ZIP files
 */
const tidyUp = async () => {
  if (fs.existsSync(TEMP_ZIP_NAME)) {
    fs.unlinkSync(TEMP_ZIP_NAME);
  }
};


const main = async () => {
  await fetchAsyncAPIExamplesFromExternalURL();
  await unzipAsyncAPIExamples();
  await buildCLIListFromExamples();
  await tidyUp();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
