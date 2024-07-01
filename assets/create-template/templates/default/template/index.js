import { File, Text } from '@asyncapi/generator-react-sdk';

export default function ({ asyncapi, params, originalAsyncAPI }) {
  return (
    <File name="asyncapi.md">
      <Text>My application's markdown file.</Text>
      <Text>App name: **{asyncapi.info().title()}**</Text>
    </File>
  );
}
