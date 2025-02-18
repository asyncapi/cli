import { AsyncAPIDocumentInterface } from '@asyncapi/parser/cjs/models';

export async function numberOfChannels(document: AsyncAPIDocumentInterface | undefined) {
  let countChannels = 0;
  if (document?.channels().length) {
    countChannels = document?.channels().length;
  }
  return countChannels;
}
