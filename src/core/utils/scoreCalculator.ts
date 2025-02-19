
export async function calculateScore(document: any | undefined) {
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
  return (scoreEvaluate / 1) * 100;
}
