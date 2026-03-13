const fs = require('fs');

// Reload from git to get original state
const { execSync } = require('child_process');
const originalData = execSync('git show HEAD:public/data/A-Level-Biology.json', { maxBuffer: 50 * 1024 * 1024 });
const data = JSON.parse(originalData.toString());

console.log('=== BEFORE ===');

const countBoards = (items, label) => {
  const boards = {};
  items.forEach(q => { q.boards.forEach(b => { boards[b] = (boards[b] || 0) + 1; }); });
  console.log(`${label}:`, boards);
};

countBoards(data.mcqs, 'MCQ boards');

// Step 1: Build clean subtopic -> boards mapping from original_flashcards (excludes generic labels)
const subtopicBoards = {};
const SPECIFIC_BOARDS = ['AQA', 'Edexcel-A', 'Edexcel-B', 'OCR-A', 'OCR-B'];

data.original_flashcards.forEach(q => {
  const st = q.subtopic;
  if (!subtopicBoards[st]) subtopicBoards[st] = new Set();
  q.boards.forEach(b => {
    if (SPECIFIC_BOARDS.includes(b)) subtopicBoards[st].add(b);
  });
});

// Also enrich from other sources but ONLY specific board labels
[...data.mcqs, ...data.flashcards, ...data.original_questions].forEach(q => {
  const st = q.subtopic;
  if (!subtopicBoards[st]) subtopicBoards[st] = new Set();
  q.boards.forEach(b => {
    if (SPECIFIC_BOARDS.includes(b)) subtopicBoards[st].add(b);
  });
});

// Step 2: Fix all items - replace generic boards AND cross-tag
const fixAndCrossTag = (items, label) => {
  let genericFixed = 0;
  let crossTagged = 0;

  items.forEach(q => {
    const newBoards = new Set();

    // Fix generic labels
    q.boards.forEach(b => {
      if (b === 'OCR') {
        // Replace with specific OCR variants based on subtopic mapping
        const known = subtopicBoards[q.subtopic];
        if (known) {
          if (known.has('OCR-A')) newBoards.add('OCR-A');
          if (known.has('OCR-B')) newBoards.add('OCR-B');
        }
        // If no specific variant found, default to OCR-A
        if (!newBoards.has('OCR-A') && !newBoards.has('OCR-B')) {
          newBoards.add('OCR-A');
        }
        genericFixed++;
      } else if (b === 'Edexcel') {
        // Replace with specific Edexcel variants
        const known = subtopicBoards[q.subtopic];
        if (known) {
          if (known.has('Edexcel-A')) newBoards.add('Edexcel-A');
          if (known.has('Edexcel-B')) newBoards.add('Edexcel-B');
        }
        // If no specific variant found, default to Edexcel-A
        if (!newBoards.has('Edexcel-A') && !newBoards.has('Edexcel-B')) {
          newBoards.add('Edexcel-A');
        }
        genericFixed++;
      } else {
        newBoards.add(b);
      }
    });

    // Cross-tag based on subtopic mapping
    const known = subtopicBoards[q.subtopic];
    if (known) {
      known.forEach(b => {
        if (!newBoards.has(b)) {
          newBoards.add(b);
          crossTagged++;
        }
      });
    }

    q.boards = [...newBoards].sort();
  });

  console.log(`${label}: fixed ${genericFixed} generic, cross-tagged ${crossTagged}`);
};

fixAndCrossTag(data.mcqs, 'MCQs');
fixAndCrossTag(data.flashcards, 'Flashcards');
fixAndCrossTag(data.original_questions, 'Original Questions');
fixAndCrossTag(data.original_flashcards, 'Original Flashcards');

console.log('\n=== AFTER ===');
countBoards(data.mcqs, 'MCQ boards');
countBoards(data.original_questions, 'OQ boards');

// Verify NO generic labels remain
const allBoards = new Set();
[...data.mcqs, ...data.flashcards, ...data.original_questions, ...data.original_flashcards].forEach(q => {
  q.boards.forEach(b => allBoards.add(b));
});
console.log('\nAll board labels in data:', [...allBoards].sort());

const edxMCQs = data.mcqs.filter(q => q.boards.some(b => b.startsWith('Edexcel'))).length;
console.log('MCQs matching Edexcel prefix:', edxMCQs);

fs.writeFileSync('public/data/A-Level-Biology.json', JSON.stringify(data, null, 2));
console.log('\nSaved.');
