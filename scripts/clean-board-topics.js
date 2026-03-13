const fs = require('fs');

// Clean up board_topics - remove cross-contaminated entries
for (const subj of ['A-Level-Chemistry', 'A-Level-Biology']) {
  const filePath = `public/data/${subj}.json`;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const allItems = [...data.mcqs, ...data.flashcards, ...data.original_questions, ...data.original_flashcards];

  console.log(`\n========= ${subj} =========`);
  let cleaned = 0;

  allItems.forEach(q => {
    if (!q.board_topics || Array.isArray(q.board_topics)) return;

    Object.entries(q.board_topics).forEach(([board, topic]) => {
      let bad = false;

      // OCR boards should have Module or Storyline topics, not Edexcel "Topic N:" format
      if (board.startsWith('OCR') && /^Topic \d/.test(topic)) bad = true;
      // OCR boards shouldn't have AQA broad categories
      if (board.startsWith('OCR') && ['Physical Chemistry', 'Inorganic Chemistry', 'Organic Chemistry'].includes(topic)) bad = true;

      // Edexcel boards should have "Topic N:" format
      if ((board === 'Edexcel' || board.startsWith('Edexcel-')) && /^Module \d/.test(topic)) bad = true;
      if ((board === 'Edexcel' || board.startsWith('Edexcel-')) && /^Storyline/.test(topic)) bad = true;

      // AQA shouldn't have Module/Topic/Storyline format
      if (board === 'AQA' && /^Module \d/.test(topic)) bad = true;
      if (board === 'AQA' && /^Topic \d/.test(topic)) bad = true;
      if (board === 'AQA' && /^Storyline/.test(topic)) bad = true;

      if (bad) {
        delete q.board_topics[board];
        cleaned++;
      }
    });
  });

  console.log(`Cleaned ${cleaned} bad board_topics entries`);

  // Now verify the clean modules for key boards
  const showModules = (items, label, boardPrefix) => {
    const matching = items.filter(q => q.boards.some(b => b.startsWith(boardPrefix)));
    const modules = new Set();
    let hasBT = 0;
    matching.forEach(q => {
      if (q.board_topics && typeof q.board_topics === 'object') {
        const found = Object.entries(q.board_topics).find(([k]) => k.startsWith(boardPrefix));
        if (found) { hasBT++; modules.add(found[1]); }
      }
    });
    console.log(`\n${label} (${boardPrefix}): ${hasBT}/${matching.length} have board_topics`);
    const sorted = [...modules].sort();
    sorted.forEach(m => {
      const count = matching.filter(q => {
        const found = Object.entries(q.board_topics || {}).find(([k]) => k.startsWith(boardPrefix));
        return found && found[1] === m;
      }).length;
      console.log(`  ${m} (${count})`);
    });
  };

  if (subj === 'A-Level-Chemistry') {
    showModules(data.mcqs, 'MCQs', 'OCR');
    showModules(data.original_flashcards, 'Orig Flashcards', 'OCR');
  } else {
    showModules(data.mcqs, 'MCQs', 'Edexcel');
    showModules(data.original_flashcards, 'Orig Flashcards', 'Edexcel');
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`\nSaved ${filePath}`);
}
