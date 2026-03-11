// Topic normalization for cross-feature linking
// When MCQs link to flashcards (or vice versa), topic names may not match exactly.
// This module provides fuzzy matching to find the best match.

/**
 * Normalize a topic string for comparison:
 * - lowercase
 * - remove parentheses content
 * - replace slashes, commas, ampersands with spaces
 * - collapse whitespace
 * - trim
 */
function normalize(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")        // remove (parenthetical)
    .replace(/[\/,&]/g, " ")           // slashes, commas, ampersands → spaces
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract significant keywords from a normalized topic string.
 * Drops common filler words.
 */
function keywords(topic: string): string[] {
  const stopWords = new Set(["and", "the", "of", "in", "for", "to", "a", "an", "with", "on", "by"]);
  return normalize(topic)
    .split(" ")
    .filter((w) => w.length > 1 && !stopWords.has(w));
}

/**
 * Score how well two topic names match (0-1).
 * 1 = perfect match, 0 = no overlap.
 */
function similarity(a: string, b: string): number {
  const normA = normalize(a);
  const normB = normalize(b);

  // Exact normalized match
  if (normA === normB) return 1;

  // One contains the other
  if (normA.includes(normB) || normB.includes(normA)) return 0.9;

  // Keyword overlap (Jaccard-like)
  const kwA = keywords(a);
  const kwB = keywords(b);
  if (kwA.length === 0 || kwB.length === 0) return 0;

  const setA = new Set(kwA);
  const setB = new Set(kwB);
  let intersection = 0;
  for (const w of setA) {
    if (setB.has(w)) intersection++;
  }
  const union = new Set([...kwA, ...kwB]).size;
  return intersection / union;
}

/**
 * Find the best matching topic from a list of available topics.
 * Returns the original topic name if exact match exists,
 * or the best fuzzy match if similarity > threshold.
 * Returns null if no good match found.
 */
export function findBestTopicMatch(
  target: string,
  availableTopics: string[],
  threshold = 0.4,
): string | null {
  // Exact match first
  const exact = availableTopics.find((t) => t === target);
  if (exact) return exact;

  // Case-insensitive exact
  const lowerTarget = target.toLowerCase();
  const caseMatch = availableTopics.find((t) => t.toLowerCase() === lowerTarget);
  if (caseMatch) return caseMatch;

  // Fuzzy match
  let bestScore = 0;
  let bestMatch: string | null = null;
  for (const topic of availableTopics) {
    const score = similarity(target, topic);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = topic;
    }
  }

  return bestScore >= threshold ? bestMatch : null;
}
