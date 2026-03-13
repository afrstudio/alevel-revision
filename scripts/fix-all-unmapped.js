const fs = require('fs');

// === CHEMISTRY: Map remaining subtopics to OCR modules ===
const CHEM_MAP = {
  'General Acid-base Definitions': 'Module 5: Physical Chemistry and Transition Elements',
  'Strong Acids & Bases': 'Module 5: Physical Chemistry and Transition Elements',
  'Acidic/basic Oxides': 'Module 3: Periodic Table and Energy',
  'Isotopes & Relative Atomic Mass': 'Module 2: Foundations in Chemistry',
  'Strong Acids & Bases, Ionic Product of Water (kw) & Ph': 'Module 5: Physical Chemistry and Transition Elements',
  'Laboratory Techniques': 'Module 1: Development of Practical Skills',
  'Stoichiometry, Limiting Reagents': 'Module 2: Foundations in Chemistry',
  'Stoichiometry, Titrations': 'Module 2: Foundations in Chemistry',
  'Electrochemistry, Cell Potential': 'Module 5: Physical Chemistry and Transition Elements',
  'Ideal Gas Equation, Stoichiometry': 'Module 2: Foundations in Chemistry',
  'Ideal Gas Equation': 'Module 2: Foundations in Chemistry',
  'Hydrated Salts, Stoichiometry': 'Module 2: Foundations in Chemistry',
  'Stoichiometry, Calculations': 'Module 2: Foundations in Chemistry',
  'Factors Affecting Electrode Potential': 'Module 5: Physical Chemistry and Transition Elements',
  'Purification Techniques': 'Module 1: Development of Practical Skills',
  // original_questions
  'Condensation Polymers': 'Module 6: Organic Chemistry and Analysis',
  'Aromatic Chemistry': 'Module 6: Organic Chemistry and Analysis',
  'Friedel-Crafts Reactions': 'Module 6: Organic Chemistry and Analysis',
  'Electrophilic Aromatic Substitution': 'Module 6: Organic Chemistry and Analysis',
  'Diazonium Compounds': 'Module 6: Organic Chemistry and Analysis',
  'Amino Acids and Proteins': 'Module 6: Organic Chemistry and Analysis',
  'Carboxylic Acids and Derivatives': 'Module 6: Organic Chemistry and Analysis',
  'Nitriles': 'Module 6: Organic Chemistry and Analysis',
  'Amines': 'Module 6: Organic Chemistry and Analysis',
  'Combined Analytical Techniques': 'Module 6: Organic Chemistry and Analysis',
  'Phenols': 'Module 6: Organic Chemistry and Analysis',
};

// === BIOLOGY: Map remaining subtopics to Edexcel topics ===
const BIO_MAP = {
  'Cell Fractionation': 'Topic 1: Lifestyle, Health and Risk',
  'Mrna Processing': 'Topic 2: Genes and Health',
  'Cell Organelles': 'Topic 1: Lifestyle, Health and Risk',
  'Nature and Nurture': 'Topic 8: Grey Matter',
};

function fixSubject(filename, mapping, boardPrefix) {
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  let fixed = 0;

  const allItems = [
    ...data.mcqs,
    ...data.flashcards,
    ...(data.original_flashcards || []),
    ...(data.original_questions || []),
  ];

  allItems.forEach(q => {
    if (!q.boards || !q.boards.some(b => b.startsWith(boardPrefix))) return;
    if (!q.board_topics || Array.isArray(q.board_topics)) q.board_topics = {};

    const hasKey = Object.keys(q.board_topics).some(k => k.startsWith(boardPrefix));
    if (hasKey) return;

    const module = mapping[q.subtopic];
    if (!module) return;

    q.boards.forEach(b => {
      if (b.startsWith(boardPrefix) && !q.board_topics[b]) {
        q.board_topics[b] = module;
        fixed++;
      }
    });
  });

  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`${filename}: fixed ${fixed} entries`);
}

fixSubject('public/data/A-Level-Chemistry.json', CHEM_MAP, 'OCR');
fixSubject('public/data/A-Level-Biology.json', BIO_MAP, 'Edexcel');

// Verify
console.log('\n--- Verification ---');
['Chemistry', 'Biology'].forEach(subject => {
  const data = JSON.parse(fs.readFileSync(`public/data/A-Level-${subject}.json`, 'utf8'));
  const prefix = subject === 'Chemistry' ? 'OCR' : 'Edexcel';

  ['flashcards', 'original_flashcards', 'original_questions'].forEach(type => {
    const items = data[type] || [];
    const matching = items.filter(q => q.boards && q.boards.some(b => b.startsWith(prefix)));
    const missing = matching.filter(q => {
      const bt = q.board_topics;
      if (!bt || typeof bt !== 'object' || Array.isArray(bt)) return true;
      return !Object.keys(bt).some(k => k.startsWith(prefix));
    });
    if (missing.length > 0) {
      console.log(`  ${subject} ${type}: ${missing.length} STILL missing`);
      const subs = [...new Set(missing.map(q => q.subtopic))];
      subs.forEach(s => console.log(`    ${s}`));
    } else {
      console.log(`  ${subject} ${type}: ALL MAPPED`);
    }
  });
});
