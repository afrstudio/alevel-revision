// SM-2 Spaced Repetition Algorithm
// Based on SuperMemo 2 by Piotr Wozniak
// https://super-memory.com/english/ol/sm2.htm

export interface SM2Card {
  interval: number;      // days until next review
  repetition: number;    // number of consecutive correct reviews
  efactor: number;       // easiness factor (1.3 - 2.5)
  nextReview: number;    // timestamp (ms) of next review
  lastReview: number;    // timestamp of last review
}

// Grade: 0-5
// 0 = complete blackout
// 1 = incorrect, remembered on seeing answer
// 2 = incorrect, answer seemed easy to recall
// 3 = correct, with serious difficulty
// 4 = correct, after hesitation
// 5 = perfect response
export type SM2Grade = 0 | 1 | 2 | 3 | 4 | 5;

export function createNewCard(): SM2Card {
  return {
    interval: 0,
    repetition: 0,
    efactor: 2.5,
    nextReview: 0,
    lastReview: 0,
  };
}

export function gradeCard(card: SM2Card, grade: SM2Grade): SM2Card {
  const now = Date.now();

  let { interval, repetition, efactor } = card;

  if (grade >= 3) {
    // Correct response
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
    repetition += 1;
  } else {
    // Incorrect - reset
    repetition = 0;
    interval = 1;
  }

  // Update easiness factor
  efactor = efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (efactor < 1.3) efactor = 1.3;

  const nextReview = now + interval * 24 * 60 * 60 * 1000;

  return {
    interval,
    repetition,
    efactor: Math.round(efactor * 100) / 100,
    nextReview,
    lastReview: now,
  };
}

// Get cards due for review, sorted by most overdue first
export function getDueCards<T extends { id: string }>(
  cards: T[],
  sm2Data: Record<string, SM2Card>,
): T[] {
  const now = Date.now();
  return cards
    .filter((c) => {
      const data = sm2Data[c.id];
      return !data || data.nextReview <= now;
    })
    .sort((a, b) => {
      const aData = sm2Data[a.id];
      const bData = sm2Data[b.id];
      const aNext = aData?.nextReview ?? 0;
      const bNext = bData?.nextReview ?? 0;
      return aNext - bNext; // most overdue first
    });
}
