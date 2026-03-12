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
    "The examiners are SHAKING right now",
    "You sure you're not googling these??",
  ]);
  if (streak >= 3) return pick([
    "Damn, now you're cooking",
    "Three straight? The revision is revisioning",
    "OK OK she's getting warmed up",
    "Yabi's in her zone, don't disturb",
    "You might actually pass at this rate",
    "Is that... competence? From YOU?",
    "Don't get excited, you still need to do this in the actual exam",
  ]);
  if (streak === 2) return pick([
    "Two in a row, don't let it get to your head",
    "Back to back! Keep that energy",
    "She's building momentum...",
    "Alright alright, not bad",
    "Even a broken clock is right twice a day",
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
    "Wow you actually knew that? I'm shocked",
    "A miracle has occurred",
  ]);
}

// MCQ wrong messages based on wrong streak
export function getWrongMessage(wrongStreak: number): string {
  if (wrongStreak >= 5) return pick([
    "Yabi I'm genuinely concerned at this point",
    "5 wrong in a row... this is a new personal best for you",
    "Should I just start filling out the resit form now?",
    "Your future self is screaming right now",
    "This is actually impressive. Like, impressively bad",
    "Mum's gonna be so proud of these results wallahi",
  ]);
  if (wrongStreak >= 4) return pick([
    "Yabi... are you even reading the question",
    "At this point just guess C every time",
    "I'm not angry, I'm just disappointed",
    "Maybe go back to the flashcards for a bit yeah?",
    "The exam board is gonna have a field day with you",
    "This is how you're gonna get that A*?? Really??",
    "Were you just staring at the screen and guessing?",
  ]);
  if (wrongStreak >= 3) return pick([
    "DAMN wrong again? Three in a row is crazy",
    "A hat-trick of wrong answers, impressive honestly",
    "You're speedrunning failure right now",
    "Bro... three?? Take a breath",
    "Three wrong... and you wonder why I made this app",
    "At this rate we should just burn your textbook",
  ]);
  if (wrongStreak === 2) return pick([
    "Wrong again? Come on Yabi",
    "Two in a row... we need to talk",
    "Not the double L...",
    "You're slacking icl",
    "Back to back wrong answers? This your revision strategy?",
    "Wow the consistency of getting it wrong... impressive",
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
    "Lol no",
    "Yikes. Read it and weep",
    "Oh Yabi... oh no",
  ]);
}

// Sarcastic messages for the "Explain this to me" button
export function getExplainButtonText(): string {
  return pick([
    "I don't get it (obviously)",
    "Explain it like I'm 5",
    "Help me I'm lost",
    "I need an adult",
    "What just happened??",
    "Make it make sense please",
    "Brain not braining rn",
    "Explain this to me",
  ]);
}

// Sarcastic header for when AI explanation loads
export function getExplainHeader(): string {
  return pick([
    "Since you clearly need help...",
    "OK let me break this down for you",
    "Pay attention this time yeah?",
    "Right, listen carefully Yabi",
    "Here's what you should've known",
    "Taking notes? You should be",
    "AI to the rescue (again)",
    "Sigh... OK here we go",
  ]);
}

// Sarcastic loading messages while AI is thinking
export function getExplainLoadingText(): string {
  return pick([
    "Consulting the braincells you don't have...",
    "Finding an explanation simple enough for you...",
    "Let me think about how to explain this to you...",
    "Processing your failure...",
    "Generating a Yabi-proof explanation...",
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
  if (pct >= 20) return "Yabi... we need an intervention";
  return "I'm speechless. And not in a good way";
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

// Subject to exam board mapping
// Returns board prefix — filtering should use startsWith to match variants (e.g. "Edexcel-A", "OCR-B")
export function getSubjectBoard(subject: string): string {
  switch (subject) {
    case "A-Level Biology":
    case "Biology":
      return "Edexcel";
    case "A-Level Maths":
    case "Maths":
      return "Edexcel";
    case "A-Level Chemistry":
    case "Chemistry":
      return "OCR";
    default:
      return "Edexcel";
  }
}

// Check if a question's boards match the target board (prefix match)
export function matchesBoard(questionBoards: string[], targetBoard: string): boolean {
  return questionBoards.some((b) => b.startsWith(targetBoard));
}
