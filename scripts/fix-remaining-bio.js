const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/A-Level-Biology.json','utf8'));
const allItems = [...data.mcqs, ...data.flashcards, ...data.original_questions, ...data.original_flashcards];

// Fix board_topics with AQA-style names appearing under Edexcel keys
const RENAMES = {
  'Biological Molecules': 'Topic 1: Biological Molecules',
  'Cells': 'Topic 1: Lifestyle, Health and Risk',
  'Organisms Respond to Changes': 'Topic 7: Run for Your Life',
  'The Control of Gene Expression': 'Topic 2: Genes and Health',
  'Genetic Information, Variation and Relationships': 'Topic 2: Genes and Health',
};

let fixed = 0;
allItems.forEach(q => {
  if (!q.board_topics || typeof q.board_topics !== 'object') return;
  Object.entries(q.board_topics).forEach(([board, topic]) => {
    if (board.startsWith('Edexcel') && RENAMES[topic]) {
      q.board_topics[board] = RENAMES[topic];
      fixed++;
    }
  });
});

console.log('Renamed:', fixed, 'Edexcel board_topics');

// Verify
const edxMcqs = data.mcqs.filter(q => q.boards.some(b => b.startsWith('Edexcel')));
const topics = new Set();
edxMcqs.forEach(q => {
  const bt = q.board_topics;
  if (bt && typeof bt === 'object') {
    Object.entries(bt).forEach(([k, v]) => {
      if (k.startsWith('Edexcel')) topics.add(v);
    });
  }
});
console.log('Edexcel MCQ topics after fix:', [...topics].sort());

fs.writeFileSync('public/data/A-Level-Biology.json', JSON.stringify(data, null, 2));
console.log('Saved.');
