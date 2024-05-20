import { AsyncAPIDocumentInterface } from '@asyncapi/parser/cjs/models';

export async function calculateScore(document: AsyncAPIDocumentInterface | undefined) {
  let scoreEvaluate = 0;
  if (document?.info().hasDescription()) {
    scoreEvaluate += 0.15;
  }
  if (document?.info().hasLicense()) {
    scoreEvaluate += 0.25;
  }
  if (!document?.servers().isEmpty()) {
    scoreEvaluate += 0.25;
  }
  if (!document?.channels().isEmpty()) {
    scoreEvaluate += 0.35;
  }
  const finalScore = (scoreEvaluate / 1) * 100;
  
  return `The score of the asyncapi document is ${finalScore}`;
}
