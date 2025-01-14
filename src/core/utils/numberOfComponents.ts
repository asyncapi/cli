import { AsyncAPIDocumentInterface } from '@asyncapi/parser/cjs/models';

export async function numberOfComponents(document: AsyncAPIDocumentInterface | undefined) {
    let countComponents = 0;
    if (document?.components().json()) {
        countComponents = document?.components().json.length;
    }
    return countComponents;
}
