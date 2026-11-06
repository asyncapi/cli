import { writeFileSync } from 'node:fs';
import bundle from '@asyncapi/bundler';

const document = await bundle(['./main.yaml'], {
  xOrigin: true,
});
const yaml = document.yml();
if (yaml) {
  writeFileSync('asyncapi.yaml', yaml);
}
