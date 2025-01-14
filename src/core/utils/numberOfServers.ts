import { AsyncAPIDocumentInterface } from '@asyncapi/parser/cjs/models';

export async function numberOfServers(document: AsyncAPIDocumentInterface | undefined) {
    let countServers = 0;
    if (document?.servers().length) {
        countServers = document?.servers().length;
    }
    return countServers;
}
