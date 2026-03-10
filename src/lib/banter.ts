// Brotherly banter messages for Yabi — streak-aware, sarcastic, supportive

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

// MCQ correct messages based on streak
export function getCorrectMessage(streak: number): string {
  if (streak >= 5) return pick([
    "5 in a row?? Who are you and what have you done with Yabi",
    "OK you're actually locked in right now",
    "Yabi is on FIRE. Nobody talk to her",
    "You're making this look too easy wallahi",
    "At this point just walk into the exam now",
  ]);
  if (streak >= 3) return pick([
    "Damn, now you're cooking",
    "Three straight? The revision is revisioning",
    "OK OK she's getting warmed up",
    "Yabi's in her zone, don't disturb",
    "You might actually pass at this rate",
  ]);
  if (streak === 2) return pick([
    "Two in a row, don't let it get to your head",
    "Back to back! Keep that energy",
    "She's building momentum...",
    "Alright alright, not bad",
  ]);
  // streak === 1 (first correct or broke a wrong streak)
  return pick([
    "There we go!",
    "Finally lol",
    "She gets one!",
    "Correct. See, you DO know stuff",
    "That's more like it",
    "W",
    "Nice one Yabs",
    "Look at you go",
  ]);
}

// MCQ wrong messages based on wrong streak
export function getWrongMessage(wrongStreak: number): string {
  if (wrongStreak >= 4) return pick([
    "Yabi... are you even reading the question",
    "At this point just guess C every time",
    "I'm not angry, I'm just disappointed",
    "Maybe go back to the flashcards for a bit yeah?",
    "The exam board is gonna have a field day with you",
  ]);
  if (wrongStreak >= 3) return pick([
    "DAMN wrong again? Three in a row is crazy",
    "A hat-trick of wrong answers, impressive honestly",
    "You're speedrunning failure right now",
    "Bro... three?? Take a breath",
  ]);
  if (wrongStreak === 2) return pick([
    "Wrong again? Come on Yabi",
    "Two in a row... we need to talk",
    "Not the double L...",
    "You're slacking icl",
  ]);
  // wrongStreak === 1
  return pick([
    "Nope",
    "Wrong. But you knew that already",
    "Not quite Yabs",
    "L. Read the explanation though fr",
    "Close but no cigar",
    "That ain't it",
    "Revision needed on this one",
  ]);
}

// Score-based session summary messages
export function getSessionMessage(correct: number, total: number): string {
  if (total === 0) return "";
  const pct = Math.round((correct / total) * 100);
  if (pct === 100) return "Perfect score?? You're actually cracked";
  if (pct >= 80) return "That's a solid session Yabi, keep it up";
  if (pct >= 60) return "Not bad, but you can do better and you know it";
  if (pct >= 40) return "We need to work on this topic fr fr";
  return "Yabi... we need an intervention";
}

// Progress page messages
export function getProgressGreeting(accuracy: number): string {
  if (accuracy >= 90) return "You're actually smashing it, keep going";
  if (accuracy >= 70) return "Decent progress, but don't get comfortable";
  if (accuracy >= 50) return "You're getting there, just keep practising yeah";
  if (accuracy > 0) return "Room for improvement... a LOT of room";
  return "Start practising to see your stats here, Yabi";
}

// Study tip messages (rotating)
export function getStudyTip(): string {
  return pick([
    "Use the AI Camera to snap your working out and get instant feedback on your method.",
    "Do at least 20 MCQs a day — consistency beats cramming every time.",
    "If you keep getting a topic wrong, hit the flashcards for that topic first.",
    "Practice papers under timed conditions at least once a week. No excuses.",
    "Read the examiner's explanation even when you get it right. Trust me.",
    "Struggling? Go back to basics. Flashcards first, then MCQs, then written Qs.",
  ]);
}
