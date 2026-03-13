const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/A-Level-Biology.json', 'utf8'));

// Map AQA-style subtopics to Edexcel official topics
const BIO_MAP = {
  // AQA Year 1 topics → Edexcel equivalents
  'Cell Division': 'Topic 3: Voice of the Genome',
  'Cell Structure': 'Topic 1: Lifestyle, Health and Risk',
  'Classification': 'Topic 4: Biodiversity and Natural Resources',
  'DNA and Protein Synthesis': 'Topic 2: Genes and Health',
  'Ecosystems': 'Topic 5: On the Wild Side',
  'Energy Transfer in Ecosystems': 'Topic 5: On the Wild Side',
  'Enzymes': 'Topic 1: Lifestyle, Health and Risk',
  'Gas Exchange': 'Topic 4: Exchange and Transport',
  'Gene Expression': 'Topic 2: Genes and Health',
  'Genetic Diversity': 'Topic 4: Biodiversity and Natural Resources',
  'Genetics and Inheritance': 'Topic 2: Genes and Health',
  'Homeostasis': 'Topic 7: Run for Your Life',
  'Immunity': 'Topic 6: Immunity, Infection and Forensics',
  'Kidney Function': 'Topic 7: Run for Your Life',
  'Mass Transport in Animals': 'Topic 1: Lifestyle, Health and Risk',
  'Mass Transport in Plants': 'Topic 4: Exchange and Transport',
  'Muscle Contraction': 'Topic 7: Run for Your Life',
  'Nervous Coordination': 'Topic 7: Run for Your Life',
  'Photosynthesis': 'Topic 5: On the Wild Side',
  'Populations and Evolution': 'Topic 4: Biodiversity and Natural Resources',
  'Respiration': 'Topic 7: Run for Your Life',
  'Transport Across Membranes': 'Topic 2: Genes and Health',
  // Flashcard leak
  'Organisms Exchange Substances with their Environment': 'Topic 4: Exchange and Transport',
};

let fixed = 0;
const allItems = [
  ...data.mcqs,
  ...data.flashcards,
  ...(data.original_flashcards || []),
  ...(data.original_questions || []),
];

allItems.forEach(q => {
  if (!q.boards || !q.boards.some(b => b.startsWith('Edexcel'))) return;
  if (!q.board_topics || Array.isArray(q.board_topics)) q.board_topics = {};

  const hasEdexcel = Object.keys(q.board_topics).some(k => k.startsWith('Edexcel'));
  if (hasEdexcel) return;

  const module = BIO_MAP[q.subtopic];
  if (!module) return;

  q.boards.forEach(b => {
    if (b.startsWith('Edexcel') && !q.board_topics[b]) {
      q.board_topics[b] = module;
      fixed++;
    }
  });
});

console.log('Fixed:', fixed, 'Edexcel board_topics entries');

// Verify
['original_questions', 'flashcards'].forEach(type => {
  const items = data[type] || [];
  const matching = items.filter(q => q.boards && q.boards.some(b => b.startsWith('Edexcel')));
  const missing = matching.filter(q => {
    const bt = q.board_topics;
    if (!bt || typeof bt !== 'object' || Array.isArray(bt)) return true;
    return !Object.keys(bt).some(k => k.startsWith('Edexcel'));
  });
  if (missing.length > 0) {
    console.log(`${type}: ${missing.length} still missing`);
    [...new Set(missing.map(q => q.subtopic))].forEach(s => console.log(`  ${s}`));
  } else {
    console.log(`${type}: ALL MAPPED`);
  }
});

fs.writeFileSync('public/data/A-Level-Biology.json', JSON.stringify(data, null, 2));
console.log('Saved.');
