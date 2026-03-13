const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/A-Level-Biology.json', 'utf8'));

const BIO_MAP = {
  'Cell Division': 'Topic 3: Voice of the Genome',
  'Cell Structure': 'Topic 1: Lifestyle, Health and Risk',
  'Classification': 'Topic 4: Biodiversity and Natural Resources',
  'DNA and Protein Synthesis': 'Topic 2: Genes and Health',
  'DNA Replication, Repair, Mutation, Evolution': 'Topic 2: Genes and Health',
  'Protein Synthesis, Antibiotics, Prokaryotic vs Eukaryotic': 'Topic 2: Genes and Health',
  'Genetic Code, Mutations, Protein Structure/Function': 'Topic 2: Genes and Health',
  'Gene Regulation, Prokaryotic vs Eukaryotic Gene Expression, Cellular Organisation': 'Topic 2: Genes and Health',
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
  'Organisms Exchange Substances with their Environment': 'Topic 4: Exchange and Transport',
  'General Principles of Exchange': 'Topic 4: Exchange and Transport',
};

const officialPattern = /^Topic \d/;
let fixed = 0;

const allItems = [
  ...data.mcqs,
  ...data.flashcards,
  ...(data.original_flashcards || []),
  ...(data.original_questions || []),
];

allItems.forEach(q => {
  if (!q.board_topics || typeof q.board_topics !== 'object' || Array.isArray(q.board_topics)) return;

  // Step 1: Fix generic "Edexcel" key → specific variant keys
  if (q.board_topics['Edexcel']) {
    const val = q.board_topics['Edexcel'];
    delete q.board_topics['Edexcel'];
    // Add to all Edexcel-specific boards this question belongs to
    q.boards.forEach(b => {
      if (b.startsWith('Edexcel') && b !== 'Edexcel' && !q.board_topics[b]) {
        q.board_topics[b] = val;
      }
    });
    // If no specific Edexcel boards, add as Edexcel-A (most common)
    if (!Object.keys(q.board_topics).some(k => k.startsWith('Edexcel'))) {
      q.board_topics['Edexcel-A'] = val;
      if (!q.boards.includes('Edexcel-A')) {
        // Replace generic with specific in boards array too
        const idx = q.boards.indexOf('Edexcel');
        if (idx === -1) q.boards.push('Edexcel-A');
      }
    }
    fixed++;
  }

  // Step 2: Fix non-official values
  Object.entries(q.board_topics).forEach(([key, val]) => {
    if (!key.startsWith('Edexcel')) return;
    if (officialPattern.test(val)) return;

    // Try mapping the value directly
    let mapped = BIO_MAP[val];
    // Try mapping the subtopic
    if (!mapped) mapped = BIO_MAP[q.subtopic];

    if (mapped) {
      q.board_topics[key] = mapped;
      fixed++;
    }
  });
});

console.log('Fixed:', fixed, 'entries');

// Verify
['mcqs', 'flashcards', 'original_flashcards', 'original_questions'].forEach(type => {
  const items = data[type] || [];
  const matching = items.filter(q => q.boards && q.boards.some(b => b.startsWith('Edexcel')));
  const bad = [];
  matching.forEach(q => {
    const bt = q.board_topics;
    if (!bt || typeof bt !== 'object' || Array.isArray(bt)) return;
    Object.entries(bt).forEach(([key, val]) => {
      if (key.startsWith('Edexcel') && !officialPattern.test(val)) {
        bad.push(`${val} (${q.subtopic})`);
      }
    });
  });
  if (bad.length) {
    console.log(`${type}: ${bad.length} still non-official`);
    [...new Set(bad)].forEach(b => console.log(`  ${b}`));
  } else {
    console.log(`${type}: CLEAN`);
  }
});

fs.writeFileSync('public/data/A-Level-Biology.json', JSON.stringify(data, null, 2));
console.log('Saved.');
