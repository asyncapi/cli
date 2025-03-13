/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs').promises;
const path = require('path');
const unzipper = require('unzipper');
const { Parser } = require('@asyncapi/parser/cjs');
const { AvroSchemaParser } = require('@asyncapi/avro-schema-parser');
const { OpenAPISchemaParser } = require('@asyncapi/openapi-schema-parser');
const { RamlDTSchemaParser } = require('@asyncapi/raml-dt-schema-parser');

const SPEC_EXAMPLES_ZIP_URL = 'https://github.com/asyncapi/spec/archive/refs/heads/master.zip';
const EXAMPLE_DIRECTORY = path.join(__dirname, '../assets/examples');
const TEMP_ZIP_NAME = path.join(__dirname, 'spec-examples.zip');

const parser = new Parser({
  schemaParsers: [AvroSchemaParser(), OpenAPISchemaParser(), RamlDTSchemaParser()],
});

/**
 * Fetch and download AsyncAPI example ZIP file
 */
const fetchAsyncAPIExamplesFromExternalURL = async () => {
  console.log('📥 Fetching AsyncAPI examples...');
  try {
    const response = await fetch(SPEC_EXAMPLES_ZIP_URL);

    if (!response.ok) {
      throw new Error(`❌ Failed to fetch examples. HTTP Status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    await fs.writeFile(TEMP_ZIP_NAME, Buffer.from(buffer));
    console.log('✅ ZIP file downloaded successfully.');
  } catch (error) {
    console.error(`⚠️ Error fetching ZIP: ${error.message}`);
    throw error;
  }
};

/**
 * Unzips the fetched ZIP file and extracts only YAML examples
 */
const unzipAsyncAPIExamples = async () => {
  console.log('📂 Extracting example files...');
  try {
    await fs.mkdir(EXAMPLE_DIRECTORY, { recursive: true });

    const zipStream = fs.createReadStream(TEMP_ZIP_NAME).pipe(unzipper.Parse());

    for await (const entry of zipStream) {
      const fileName = entry.path;
      if (fileName.includes('examples/') && fileName.endsWith('.yml') && entry.type === 'File') {
        const extractedFileName = fileName.split('examples/')[1];
        entry.pipe(fs.createWriteStream(path.join(EXAMPLE_DIRECTORY, extractedFileName)));
      } else {
        entry.autodrain();
      }
    }
    console.log('✅ All examples extracted successfully.');
  } catch (error) {
    console.error(`⚠️ Error extracting ZIP: ${error.message}`);
    throw error;
  }
};

/**
 * Reads example files, parses them, and generates a structured JSON file
 */
const buildCLIListFromExamples = async () => {
  console.log('📜 Building CLI list from examples...');
  try {
    const files = await fs.readdir(EXAMPLE_DIRECTORY);
    const exampleFiles = files.filter(file => file.endsWith('.yml'));

    const parsedExamples = await Promise.all(
      exampleFiles.map(async file => {
        const filePath = path.join(EXAMPLE_DIRECTORY, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');

        try {
          const { document } = await parser.parse(fileContent);
          if (!document) throw new Error(`Invalid AsyncAPI format in ${file}`);

          const title = document.info()?.title() || 'Unknown Title';
          const protocols = listAllProtocolsForFile(document);
          return { name: protocols ? `${title} - (protocols: ${protocols})` : title, value: file };
        } catch (error) {
          console.error(`⚠️ Error parsing ${file}: ${error.message}`);
          return null;
        }
      })
    );

    // Filter out failed parses and sort results
    const exampleList = parsedExamples.filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));

    await fs.writeFile(
      path.join(EXAMPLE_DIRECTORY, 'examples.json'),
      JSON.stringify(exampleList, null, 2)
    );
    console.log('✅ CLI example list created successfully.');
  } catch (error) {
    console.error(`❌ Error building example list: ${error.message}`);
    throw error;
  }
};

/**
 * Extracts all protocols from the parsed AsyncAPI document
 */
const listAllProtocolsForFile = (document) => {
  const servers = document.servers();
  if (!servers) return '';
  return servers.all().map(server => server.protocol()).join(', ');
};

/**
 * Cleans up temporary files
 */
const tidyUp = async () => {
  console.log('🧹 Cleaning up temporary files...');
  try {
    await fs.unlink(TEMP_ZIP_NAME);
    console.log('✅ Cleanup complete.');
  } catch (error) {
    if (error.code !== 'ENOENT') { // Ignore "file not found" errors
      console.error(`⚠️ Error cleaning up: ${error.message}`);
    }
  }
};

/**
 * Executes the workflow in sequence
 */
(async () => {
  try {
    await fetchAsyncAPIExamplesFromExternalURL();
    await unzipAsyncAPIExamples();
    await buildCLIListFromExamples();
  } catch (error) {
    console.error('❌ Process failed:', error.message);
  } finally {
    await tidyUp();
  }
})();
