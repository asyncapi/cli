/* eslint-disable @typescript-eslint/no-var-requires */

const request = require('request');
const fs = require('fs');
const unzipper = require('unzipper');
const path = require('path');
const parser = require('@asyncapi/parser');

const SPEC_EXAMPLES_ZIP_URL = 'https://github.com/asyncapi/spec/archive/refs/tags/v2.3.0.zip';
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

  const listAllProtocolsForFile = (parsedAsyncAPI) => {
    if (!parsedAsyncAPI.hasServers()) {return '';}
    const servers = parsedAsyncAPI.servers();
    return Object.keys(servers).map(server => servers[String(server)].protocol()).join(',');
  };

  const buildExampleList = examples.map(async example => {
    const examplePath = path.join(EXAMPLE_DIRECTORY, example);
    const exampleContent = fs.readFileSync(examplePath, { encoding: 'utf-8'});
    
    try {
      const parsedSpec = await parser.parse(exampleContent);
      const title = parsedSpec.info().title();
      const protocols = listAllProtocolsForFile(parsedSpec);
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

