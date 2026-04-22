export function cleanText(text) {
  return text
    .replace(/\s+/g, " ")
    .trim();
}

export function splitWords(text) {
  return cleanText(text).split(" ");
}

export function getPivotIndex(word) {
  if (word.length <= 2) return 0;
  if (word.length <= 5) return 1;
  if (word.length <= 9) return 2;
  return Math.floor(word.length / 2);
}

export function getDelay(word, baseDelay) {
  if (word.endsWith(".")) return baseDelay * 2;
  if (word.endsWith(",")) return baseDelay * 1.5;
  return baseDelay;
}