
import { File } from '@asyncapi/generator-react-sdk';
import fetch from 'node-fetch';
export default async function ({ asyncapi }) {
  const description = asyncapi.info().description();
  const packageName = '@asyncapi/generator-react-sdk';
  const npmRegistryUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
  const response = await fetch(npmRegistryUrl);
  const data = await response.json();
  const generatorSDKversion = data['dist-tags'].latest;
  return (
    <File name={'package.json'}>{`{
  "name": "${asyncapi.info().title().toLowerCase().replace(/ /g, '-')}",
  "version": "0.1.0",
  "description": "${description ? asyncapi.info().description().split('\n')[0] : ''}",
  "dependencies": {
    "@asyncapi/generator-react-sdk": "^${generatorSDKversion}"
  }
}`}</File>
  );
}
