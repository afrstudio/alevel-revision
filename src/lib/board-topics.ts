// Get the display topic for a question based on the active board filter
// Uses board_topics (official module names) when available, falls back to subtopic
export function getDisplayTopic(
  boardTopics: Record<string, string> | string[] | undefined,
  boards: string[],
  boardFilter: string,
  subtopic: string
): string {
  if (!boardTopics || Array.isArray(boardTopics)) return subtopic;

  if (boardFilter === "all") {
    // When showing all boards, use the first available board_topic or subtopic
    const first = Object.values(boardTopics)[0];
    return first || subtopic;
  }

  // Find board_topic matching the filter (exact or prefix match)
  for (const [board, topic] of Object.entries(boardTopics)) {
    if (board === boardFilter || board.startsWith(boardFilter)) {
      return topic;
    }
  }

  return subtopic;
}
