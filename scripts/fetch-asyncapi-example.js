/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs').promises;
const path = require('path');
const unzipper = require('unzipper');
const { Parser } = require('@asyncapi/parser/cjs');
const { AvroSchemaParser } = require('@asyncapi/avro-schema-parser');
const { OpenAPISchemaParser } = require('@asyncapi/openapi-schema-parser');
const { RamlDTSchemaParser } = require('@asyncapi/raml-dt-schema-parser');
const fetch = require('node-fetch');

const SPEC_EXAMPLES_ZIP_URL = 'https://github.com/asyncapi/spec/archive/refs/heads/master.zip';
const EXAMPLE_DIRECTORY = path.join(__dirname, '../assets/examples');
const TEMP_ZIP_NAME = path.join(__dirname, 'spec-examples.zip');

const parser = new Parser({
  schemaParsers: [AvroSchemaParser(), OpenAPISchemaParser(), RamlDTSchemaParser()],
});

/**
 * File Helper Utility - Manages common file operations
 */
const fileHelper = {
  async read(filePath) {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.error(`Error reading ${filePath}: ${error.message}`);
      throw error;
    }
  },

  async write(filePath, content) {
    try {
      await fs.writeFile(filePath, content);
    } catch (error) {
      console.error(`Error writing to ${filePath}: ${error.message}`);
      throw error;
    }
  },

  async list(directory) {
    try {
      return await fs.readdir(directory);
    } catch (error) {
      console.error(`Error reading directory ${directory}: ${error.message}`);
      throw error;
    }
  },

  async remove(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(`Cleanup warning: ${error.message}`);
    }
  },
};

/**
 * Fetch and download AsyncAPI example ZIP file
 */
const fetchAsyncAPIExamplesFromExternalURL = async () => {
  console.log('Fetching AsyncAPI examples...');
  try {
    const response = await fetch(SPEC_EXAMPLES_ZIP_URL);
    if (!response.ok) throw new Error(`Failed to fetch examples. HTTP Status: ${response.status}`);

    const buffer = await response.buffer();
    await fileHelper.write(TEMP_ZIP_NAME, buffer);
    console.log('ZIP file downloaded successfully.');
  } catch (error) {
    console.error(`Error fetching ZIP: ${error.message}`);
    throw error;
  }
};

/**
 * Unzips the fetched ZIP file and extracts only YAML examples
 */
const unzipAsyncAPIExamples = async () => {
  console.log('Extracting example files...');
  try {
    await fs.mkdir(EXAMPLE_DIRECTORY, { recursive: true });

    const zipStream = fs.createReadStream(TEMP_ZIP_NAME).pipe(unzipper.Parse());
    for await (const entry of zipStream) {
      const fileName = entry.path;
      if (fileName.includes('examples/') && fileName.endsWith('.yml') && entry.type === 'File') {
        const fileContent = await entry.buffer();
        const extractedFileName = fileName.split('examples/')[1];
        await fileHelper.write(path.join(EXAMPLE_DIRECTORY, extractedFileName), fileContent.toString());
      } else {
        entry.autodrain();
      }
    }
    console.log('All examples extracted successfully.');
  } catch (error) {
    console.error(`Error extracting ZIP: ${error.message}`);
    throw error;
  }
};

/**
 * Parses a single AsyncAPI example file
 */
const parseExampleFile = async (filePath) => {
  try {
    const fileContent = await fileHelper.read(filePath);
    const { document } = await parser.parse(fileContent);
    if (!document) return null;

    const title = document.info()?.title() || 'Unknown Title';
    const protocols = listAllProtocolsForFile(document);

    return { name: protocols ? `${title} - (protocols: ${protocols})` : title, value: filePath };
  } catch (error) {
    console.error(`Error parsing ${filePath}: ${error.message}`);
    return null;
  }
};

/**
 * Reads example files, parses them, and generates a structured JSON file
 */
const buildCLIListFromExamples = async () => {
  console.log('Building CLI list from examples...');
  try {
    const files = await fileHelper.list(EXAMPLE_DIRECTORY);
    const exampleFiles = files.filter(file => file.endsWith('.yml'));

    const parsedExamples = await Promise.all(exampleFiles.map(parseExampleFile));

    const exampleList = parsedExamples.filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
    await fileHelper.write(path.join(EXAMPLE_DIRECTORY, 'examples.json'), JSON.stringify(exampleList, null, 2));

    console.log('CLI example list created successfully.');
  } catch (error) {
    console.error(`Error building example list: ${error.message}`);
    throw error;
  }
};

/**
 * Extracts all protocols from the parsed AsyncAPI document
 */
const listAllProtocolsForFile = (document) => {
  const servers = document.servers();
  return servers ? servers.all().map(server => server.protocol()).join(', ') : '';
};

/**
 * Cleans up temporary files
 */
const tidyUp = async () => {
  console.log('Cleaning up temporary files...');
  await fileHelper.remove(TEMP_ZIP_NAME);
  console.log('Cleanup complete.');
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
    console.error('Process failed:', error.message);
  } finally {
    await tidyUp();
  }
})();
