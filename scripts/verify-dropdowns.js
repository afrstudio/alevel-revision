const fs = require('fs');

function getDisplayTopic(boardTopics, boards, boardFilter, subtopic) {
  if (!boardTopics || Array.isArray(boardTopics)) return subtopic;
  if (boardFilter === 'all') {
    const first = Object.values(boardTopics)[0];
    return first || subtopic;
  }
  for (const [board, topic] of Object.entries(boardTopics)) {
    if (board === boardFilter || board.startsWith(boardFilter)) {
      return topic;
    }
  }
  return subtopic;
}

['Chemistry', 'Biology'].forEach(subject => {
  const data = JSON.parse(fs.readFileSync(`public/data/A-Level-${subject}.json`, 'utf8'));
  const prefix = subject === 'Chemistry' ? 'OCR' : 'Edexcel';

  console.log(`\n=== ${subject} (${prefix}) ===`);

  ['mcqs', 'flashcards', 'original_questions'].forEach(type => {
    const items = data[type] || [];
    const matching = items.filter(q => q.boards && q.boards.some(b => b.startsWith(prefix)));
    const topics = new Set();
    matching.forEach(q => {
      topics.add(getDisplayTopic(q.board_topics, q.boards, prefix, q.subtopic));
    });
    const sorted = [...topics].sort();
    const officialPattern = subject === 'Chemistry' ? /^Module \d/ : /^Topic \d/;
    const nonOfficial = sorted.filter(t => !officialPattern.test(t));
    console.log(`  ${type}: ${sorted.length} topics${nonOfficial.length ? ` (${nonOfficial.length} NON-OFFICIAL)` : ' (all official)'}`);
    if (nonOfficial.length) {
      nonOfficial.forEach(t => console.log(`    LEAK: ${t}`));
    } else {
      sorted.forEach(t => console.log(`    ${t}`));
    }
  });
});
