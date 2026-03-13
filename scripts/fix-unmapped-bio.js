const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/A-Level-Biology.json','utf8'));
const allItems = [...data.mcqs, ...data.flashcards, ...data.original_questions, ...data.original_flashcards];

// Map remaining unmapped subtopics to Edexcel topics
const SUBTOPIC_TO_EDEXCEL = {
  'Biological Molecules': 'Topic 1: Biological Molecules',
  'Cells': 'Topic 1: Lifestyle, Health and Risk',
  'Brain Development': 'Topic 8: Grey Matter',
  'Brain Scanning': 'Topic 8: Grey Matter',
  'Brain Structure and Function': 'Topic 8: Grey Matter',
  'Habituation': 'Topic 8: Grey Matter',
  'Learning and Habituation': 'Topic 8: Grey Matter',
  'Transcription': 'Topic 2: Genes and Health',
  'Translation': 'Topic 2: Genes and Health',
  'Visual Cortex': 'Topic 8: Grey Matter',
  'Receptors': 'Topic 7: Run for Your Life',
  'Nervous System': 'Topic 7: Run for Your Life',
  'Synaptic Transmission': 'Topic 7: Run for Your Life',
  'Neurotransmitters and Drugs': 'Topic 7: Run for Your Life',
  'Vision': 'Topic 8: Grey Matter',
  'Muscles and Movement': 'Topic 7: Run for Your Life',
  'Homeostasis': 'Topic 7: Run for Your Life',
  'Survival and Response': 'Topic 7: Run for Your Life',
  'Eukaryotic and Prokaryotic Cells': 'Topic 1: Lifestyle, Health and Risk',
  'Prokaryotic and Eukaryotic Cells': 'Topic 1: Lifestyle, Health and Risk',
  'Cell Structure': 'Topic 1: Lifestyle, Health and Risk',
  'Cell Specialisation': 'Topic 3: Voice of the Genome',
  'Cell Differentiation and Specialisation': 'Topic 3: Voice of the Genome',
  'Specialised Cells': 'Topic 3: Voice of the Genome',
  'Specialised Cells and Cell Cycle': 'Topic 3: Voice of the Genome',
  'Stem Cells': 'Topic 3: Voice of the Genome',
  'Stem Cells and Specialised Cells': 'Topic 3: Voice of the Genome',
  'Cell Membranes and Transport': 'Topic 2: Genes and Health',
  'Cell Membranes and Cystic Fibrosis': 'Topic 2: Genes and Health',
  'Enzymes': 'Topic 1: Lifestyle, Health and Risk',
  'Enzymes and Digestion': 'Topic 1: Lifestyle, Health and Risk',
  'Cell Division': 'Topic 3: Voice of the Genome',
  'Cell Division and Development': 'Topic 3: Voice of the Genome',
  'Cell Cycle': 'Topic 3: Voice of the Genome',
  'Microscopy': 'Topic 1: Lifestyle, Health and Risk',
  'Levels of Organisation': 'Topic 1: Lifestyle, Health and Risk',
  'Tissues and Organs': 'Topic 1: Lifestyle, Health and Risk',
};

let fixed = 0;
allItems.forEach(q => {
  if (!q.board_topics || Array.isArray(q.board_topics)) q.board_topics = {};

  const module = SUBTOPIC_TO_EDEXCEL[q.subtopic];
  if (!module) return;

  q.boards.forEach(b => {
    if (b.startsWith('Edexcel') && !q.board_topics[b]) {
      q.board_topics[b] = module;
      fixed++;
    }
  });
});

console.log('Fixed:', fixed, 'board_topics entries');

// Verify: what Edexcel topics remain unmapped for MCQs?
const edxMcqs = data.mcqs.filter(q => q.boards.some(b => b.startsWith('Edexcel')));
const missing = edxMcqs.filter(q => {
  const bt = q.board_topics;
  if (!bt || typeof bt !== 'object') return true;
  return !Object.keys(bt).some(k => k.startsWith('Edexcel'));
});
console.log('MCQs still missing Edexcel board_topics:', missing.length);
if (missing.length > 0) {
  const subs = [...new Set(missing.map(q => q.subtopic))].sort();
  subs.forEach(s => console.log('  ' + s));
}

fs.writeFileSync('public/data/A-Level-Biology.json', JSON.stringify(data, null, 2));
console.log('Saved.');
