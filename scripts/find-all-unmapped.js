const fs = require('fs');

// Check Chemistry (OCR) and Biology (Edexcel) for unmapped flashcards and original_questions
['Chemistry', 'Biology'].forEach(subject => {
  const data = JSON.parse(fs.readFileSync(`public/data/A-Level-${subject}.json`, 'utf8'));
  const boardPrefix = subject === 'Chemistry' ? 'OCR' : 'Edexcel';

  console.log(`\n=== ${subject} (${boardPrefix}) ===`);

  ['flashcards', 'original_flashcards', 'original_questions'].forEach(type => {
    const items = data[type] || [];
    const matching = items.filter(q => q.boards && q.boards.some(b => b.startsWith(boardPrefix)));
    const missing = matching.filter(q => {
      const bt = q.board_topics;
      if (!bt || typeof bt !== 'object' || Array.isArray(bt)) return true;
      return !Object.keys(bt).some(k => k.startsWith(boardPrefix));
    });

    if (missing.length === 0) {
      console.log(`  ${type}: all ${matching.length} mapped`);
      return;
    }

    console.log(`  ${type}: ${missing.length}/${matching.length} missing board_topics`);
    const subs = {};
    missing.forEach(q => {
      const st = q.subtopic || '(no subtopic)';
      subs[st] = (subs[st] || 0) + 1;
    });
    Object.entries(subs).sort((a, b) => b[1] - a[1]).forEach(([st, count]) => {
      console.log(`    ${st} (${count})`);
    });
  });
});
