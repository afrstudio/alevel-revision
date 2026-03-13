const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/A-Level-Chemistry.json','utf8'));
const ocrMcqs = data.mcqs.filter(q => q.boards.some(b => b.startsWith('OCR')));

const missing = ocrMcqs.filter(q => {
  const bt = q.board_topics;
  if (!bt || typeof bt !== 'object') return true;
  return !Object.keys(bt).some(k => k.startsWith('OCR'));
});

console.log('MCQs missing OCR board_topics:', missing.length);
const subtopics = [...new Set(missing.map(q => q.subtopic))].sort();
subtopics.forEach(st => {
  const count = missing.filter(q => q.subtopic === st).length;
  // Try to determine which module this subtopic belongs to
  console.log(`  ${st} (${count})`);
});

// Map these remaining subtopics to OCR modules based on content
const SUBTOPIC_TO_MODULE = {
  'Assigning Oxidation States': 'Module 2: Foundations in Chemistry',
  'Condensation Polymers': 'Module 6: Organic Chemistry and Analysis',
  'Diazonium Compounds': 'Module 6: Organic Chemistry and Analysis',
  'Disproportionation Reactions of Halogens': 'Module 3: Periodic Table and Energy',
  'Friedel-Crafts Reactions': 'Module 6: Organic Chemistry and Analysis',
  'Identifying Oxidation and Reduction': 'Module 2: Foundations in Chemistry',
  'Identifying Oxidising and Reducing Agents': 'Module 2: Foundations in Chemistry',
  'Module 1: Development of Practical Skills': 'Module 1: Development of Practical Skills',
  'Nitriles': 'Module 6: Organic Chemistry and Analysis',
  'Organic Synthesis': 'Module 6: Organic Chemistry and Analysis',
  'Phenols': 'Module 6: Organic Chemistry and Analysis',
  'Polymers': 'Module 4: Core Organic Chemistry',
  'Practical Skills Assessed in Written Examinations': 'Module 1: Development of Practical Skills',
  'Reactivity of Halogens and Halide Ions': 'Module 3: Periodic Table and Energy',
  'Tests for Halide Ions': 'Module 3: Periodic Table and Energy',
};

// Apply mapping
let fixed = 0;
missing.forEach(q => {
  const module = SUBTOPIC_TO_MODULE[q.subtopic];
  if (module) {
    if (!q.board_topics) q.board_topics = {};
    // Add OCR-A mapping (OCR-B uses same module names)
    q.boards.forEach(b => {
      if (b.startsWith('OCR') && !q.board_topics[b]) {
        q.board_topics[b] = module;
        fixed++;
      }
    });
  }
});
console.log('\nFixed:', fixed, 'board_topics entries');

// Verify
const stillMissing = ocrMcqs.filter(q => {
  const bt = q.board_topics;
  if (!bt || typeof bt !== 'object') return true;
  return !Object.keys(bt).some(k => k.startsWith('OCR'));
});
console.log('Still missing:', stillMissing.length);

fs.writeFileSync('public/data/A-Level-Chemistry.json', JSON.stringify(data, null, 2));
console.log('Saved.');
