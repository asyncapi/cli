import { File, Text } from '@asyncapi/generator-react-sdk';

export default function({ asyncapi, params, originalAsyncAPI }) {
  return (
    <File name="asyncapi.md">
      <Text>This is a markdown file for my application.</Text>
      <Text>App name is: **{ asyncapi.info().title() }**</Text>
      <Text>{params.customParam}</Text>
    </File>
  );
}
