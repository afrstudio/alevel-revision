const fs = require('fs');

// Fix Chemistry board tagging
const chemPath = 'public/data/A-Level-Chemistry.json';
const data = JSON.parse(fs.readFileSync(chemPath, 'utf8'));

// Step 1: Build subtopic -> boards mapping from original_flashcards (most complete source)
const subtopicBoards = {};
data.original_flashcards.forEach(q => {
  const st = q.subtopic;
  if (!subtopicBoards[st]) subtopicBoards[st] = new Set();
  q.boards.forEach(b => subtopicBoards[st].add(b));
});

// Also enrich from all other sources (excluding generic 'OCR')
[...data.mcqs, ...data.flashcards, ...data.original_questions].forEach(q => {
  const st = q.subtopic;
  if (!subtopicBoards[st]) subtopicBoards[st] = new Set();
  q.boards.forEach(b => {
    if (b !== 'OCR') subtopicBoards[st].add(b);
  });
});

console.log('=== BEFORE ===');

// Count MCQs matching OCR prefix before
const ocrBefore = data.mcqs.filter(q => q.boards.some(b => b.startsWith('OCR'))).length;
console.log('MCQs matching OCR prefix:', ocrBefore);

// Step 2: Fix generic "OCR" -> "OCR-A" (Module 6 is OCR-A spec)
let fixedGenericOCR = 0;
const fixBoards = (boards) => {
  return boards.map(b => {
    if (b === 'OCR') {
      fixedGenericOCR++;
      return 'OCR-A';
    }
    return b;
  });
};

// Step 3: Cross-tag all content based on subtopic mapping
const crossTag = (items, label) => {
  let added = 0;
  items.forEach(q => {
    // Fix generic OCR first
    q.boards = fixBoards(q.boards);

    const known = subtopicBoards[q.subtopic];
    if (!known) return;

    const current = new Set(q.boards);
    known.forEach(b => {
      if (!current.has(b)) {
        q.boards.push(b);
        added++;
      }
    });

    // Deduplicate
    q.boards = [...new Set(q.boards)].sort();
  });
  console.log(`${label}: added ${added} board tags`);
};

crossTag(data.mcqs, 'MCQs');
crossTag(data.flashcards, 'Flashcards');
crossTag(data.original_questions, 'Original Questions');
crossTag(data.original_flashcards, 'Original Flashcards');

console.log('Fixed generic OCR -> OCR-A:', fixedGenericOCR, 'entries');

// Count after
const ocrAfter = data.mcqs.filter(q => q.boards.some(b => b.startsWith('OCR'))).length;
console.log('\n=== AFTER ===');
console.log('MCQs matching OCR prefix:', ocrAfter);

// Board breakdown after
const mcqBoards = {};
data.mcqs.forEach(q => {
  q.boards.forEach(b => { mcqBoards[b] = (mcqBoards[b] || 0) + 1; });
});
console.log('MCQ board breakdown:', mcqBoards);

const fcBoards = {};
data.flashcards.forEach(q => {
  q.boards.forEach(b => { fcBoards[b] = (fcBoards[b] || 0) + 1; });
});
console.log('Flashcard board breakdown:', fcBoards);

const oqBoards = {};
data.original_questions.forEach(q => {
  q.boards.forEach(b => { oqBoards[b] = (oqBoards[b] || 0) + 1; });
});
console.log('Original Questions board breakdown:', oqBoards);

// Also fix the 1 duplicate MCQ
const seen = new Set();
const deduped = data.mcqs.filter(q => {
  const key = q.question.substring(0, 100);
  if (seen.has(key)) {
    console.log('Removing duplicate MCQ:', q.id);
    return false;
  }
  seen.add(key);
  return true;
});
if (deduped.length !== data.mcqs.length) {
  console.log('Removed', data.mcqs.length - deduped.length, 'duplicate MCQs');
  data.mcqs = deduped;
}

// Write back
fs.writeFileSync(chemPath, JSON.stringify(data, null, 2));
console.log('\nSaved to', chemPath);
