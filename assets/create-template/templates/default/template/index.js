import { File, Text } from '@asyncapi/generator-react-sdk';

// Pass the others parameters to get the specificatin of the asyncapi document
export default function ({ asyncapi }) {
  return (
    <File name="asyncapi.md">
      <Text>My application's markdown file.</Text>
      <Text>App name: **{asyncapi.info().title()}**</Text>
    </File>
  );
}
