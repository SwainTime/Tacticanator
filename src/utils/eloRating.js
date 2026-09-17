export const defaultRating = 1200;
const kFactor = 24;

export function computeNewRating(playerRating, puzzleRating, won) {
  const expectedScore = 1 / (1 + Math.pow(10, (puzzleRating - playerRating) / 400));
  const actualScore = won ? 1 : 0;
  return Math.round(playerRating + kFactor * (actualScore - expectedScore));
}