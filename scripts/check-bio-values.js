const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/A-Level-Biology.json', 'utf8'));

const officialPattern = /^Topic \d/;

['original_questions', 'flashcards', 'original_flashcards'].forEach(type => {
  const items = data[type] || [];
  const matching = items.filter(q => q.boards && q.boards.some(b => b.startsWith('Edexcel')));
  const badValues = [];

  matching.forEach(q => {
    const bt = q.board_topics;
    if (!bt || typeof bt !== 'object' || Array.isArray(bt)) return;
    Object.entries(bt).forEach(([key, val]) => {
      if (key.startsWith('Edexcel') && !officialPattern.test(val)) {
        badValues.push({ subtopic: q.subtopic, key, val });
      }
    });
  });

  if (badValues.length > 0) {
    console.log(`${type}: ${badValues.length} with non-official Edexcel board_topic values`);
    const unique = [...new Set(badValues.map(b => `${b.key}: "${b.val}" (subtopic: ${b.subtopic})`))];
    unique.forEach(u => console.log(`  ${u}`));
  } else {
    console.log(`${type}: all Edexcel values are official`);
  }
});
