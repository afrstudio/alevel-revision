const fs = require('fs');

// Fix board_topics for all subjects - backfill module names for cross-tagged items
for (const subj of ['A-Level-Chemistry', 'A-Level-Biology']) {
  const filePath = `public/data/${subj}.json`;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const allItems = [...data.mcqs, ...data.flashcards, ...data.original_questions, ...data.original_flashcards];

  console.log(`\n========= ${subj} =========`);

  // Step 1: Build subtopic -> {board: module} mapping from items with good board_topics
  const subtopicToModule = {}; // subtopic -> {board: module_name}

  allItems.forEach(q => {
    const bt = q.board_topics;
    if (!bt || Array.isArray(bt)) return;
    Object.entries(bt).forEach(([board, module]) => {
      // Skip entries where module looks like it's from wrong board
      // OCR modules start with "Module" or "Storyline"
      // Edexcel modules start with "Topic"
      // AQA modules are broad categories
      if (board.startsWith('OCR') && module.startsWith('Topic ')) return; // Edexcel topic in OCR key
      if (board === 'Edexcel' && module.startsWith('Module ')) return; // OCR module in Edexcel key
      if (board.startsWith('Edexcel-') && module.startsWith('Module ')) return;

      if (!subtopicToModule[q.subtopic]) subtopicToModule[q.subtopic] = {};
      if (!subtopicToModule[q.subtopic][board]) {
        subtopicToModule[q.subtopic][board] = module;
      }
    });
  });

  // Step 2: For each board, propagate module names from specific to prefix
  // e.g., if subtopic has OCR-A mapping, also use it for OCR-B if missing
  Object.keys(subtopicToModule).forEach(st => {
    const mapping = subtopicToModule[st];
    // OCR: if OCR-A exists but OCR-B doesn't, copy OCR-A to OCR-B (same modules)
    if (mapping['OCR-A'] && !mapping['OCR-B']) mapping['OCR-B'] = mapping['OCR-A'];
    if (mapping['OCR-B'] && !mapping['OCR-A']) mapping['OCR-A'] = mapping['OCR-B'];
    // Edexcel: if Edexcel-A exists but Edexcel-B doesn't (Bio)
    if (mapping['Edexcel-A'] && !mapping['Edexcel-B']) mapping['Edexcel-B'] = mapping['Edexcel-A'];
    if (mapping['Edexcel-B'] && !mapping['Edexcel-A']) mapping['Edexcel-A'] = mapping['Edexcel-B'];
  });

  // Step 3: Backfill board_topics for all items
  let backfilled = 0;
  allItems.forEach(q => {
    if (Array.isArray(q.board_topics)) {
      q.board_topics = {};
    }
    if (!q.board_topics) q.board_topics = {};

    const mapping = subtopicToModule[q.subtopic];
    if (!mapping) return;

    q.boards.forEach(board => {
      if (!q.board_topics[board] && mapping[board]) {
        q.board_topics[board] = mapping[board];
        backfilled++;
      }
    });
  });

  console.log(`Backfilled ${backfilled} board_topics entries`);

  // Step 4: Verify coverage for key boards
  const checkBoard = (items, label, boardPrefix) => {
    const matching = items.filter(q => q.boards.some(b => b.startsWith(boardPrefix)));
    let hasBT = 0;
    const modules = new Set();
    matching.forEach(q => {
      const bt = q.board_topics;
      if (bt && typeof bt === 'object') {
        const found = Object.entries(bt).find(([k]) => k.startsWith(boardPrefix));
        if (found) {
          hasBT++;
          modules.add(found[1]);
        }
      }
    });
    console.log(`\n${label} (${boardPrefix}): ${hasBT}/${matching.length} have board_topics`);
    console.log(`  Modules: ${[...modules].sort().join(', ')}`);
  };

  if (subj === 'A-Level-Chemistry') {
    checkBoard(data.mcqs, 'MCQs', 'OCR');
    checkBoard(data.flashcards, 'Flashcards', 'OCR');
    checkBoard(data.original_flashcards, 'Orig Flashcards', 'OCR');
  } else {
    checkBoard(data.mcqs, 'MCQs', 'Edexcel');
    checkBoard(data.flashcards, 'Flashcards', 'Edexcel');
    checkBoard(data.original_flashcards, 'Orig Flashcards', 'Edexcel');
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`\nSaved ${filePath}`);
}
