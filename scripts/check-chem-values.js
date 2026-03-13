const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/A-Level-Chemistry.json', 'utf8'));

const officialPattern = /^(Module \d|Storyline \d)/;

['mcqs', 'flashcards', 'original_flashcards', 'original_questions'].forEach(type => {
  const items = data[type] || [];
  const matching = items.filter(q => q.boards && q.boards.some(b => b.startsWith('OCR')));
  const bad = [];
  const genericKey = [];

  matching.forEach(q => {
    const bt = q.board_topics;
    if (!bt || typeof bt !== 'object' || Array.isArray(bt)) return;
    Object.entries(bt).forEach(([key, val]) => {
      if (key === 'OCR') genericKey.push({ subtopic: q.subtopic, val });
      if (key.startsWith('OCR') && !officialPattern.test(val)) {
        bad.push(`${key}: "${val}" (${q.subtopic})`);
      }
    });
  });

  if (genericKey.length) console.log(`${type}: ${genericKey.length} with generic "OCR" key`);
  if (bad.length) {
    console.log(`${type}: ${bad.length} non-official values`);
    [...new Set(bad)].slice(0, 10).forEach(b => console.log(`  ${b}`));
  }
  if (!genericKey.length && !bad.length) console.log(`${type}: CLEAN`);
});
