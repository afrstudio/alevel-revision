// Progress tracking engine - localStorage backed
import type { Subject } from "@/types";
import type { SM2Card } from "./sm2";

// --- Types ---

export interface MCQAttempt {
  questionId: string;
  subject: Subject;
  subtopic: string;
  difficulty: string;
  correct: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  timestamp: number;
}

export interface FlashcardReview {
  cardId: string;
  subject: Subject;
  subtopic: string;
  knewIt: boolean;
  timestamp: number;
}

export interface QuestionAttempt {
  questionId: string;
  subject: Subject;
  subtopic: string;
  marks: number;
  totalMarks: number;
  timestamp: number;
}

export interface CameraAttempt {
  subject: Subject;
  questionContext: string;
  score: number;
  totalMarks: number;
  extractedAnswer: string;
  feedback: string;
  improvements: string[];
  timestamp: number;
}

export interface WeakTopic {
  topic: string;
  subject: Subject;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  mcqsAnswered: number;
  mcqsCorrect: number;
  flashcardsReviewed: number;
  flashcardsKnown: number;
  questionsAttempted: number;
  cameraMarks: number;
}

export interface ProgressData {
  mcqAttempts: MCQAttempt[];
  flashcardReviews: FlashcardReview[];
  questionAttempts: QuestionAttempt[];
  cameraAttempts: CameraAttempt[];
  sm2Data: Record<string, SM2Card>;
  dailyStats: Record<string, DailyStats>;
  streakDays: number;
  lastActiveDate: string;
  boardFilter: string;
}

// --- Storage ---

const STORAGE_KEY = "alevel-revision-progress";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function loadProgress(): ProgressData {
  if (typeof window === "undefined") return createEmpty();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmpty();
    return JSON.parse(raw) as ProgressData;
  } catch {
    return createEmpty();
  }
}

function saveProgress(data: ProgressData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full - trim old data
    trimOldData(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Give up silently
    }
  }
}

function createEmpty(): ProgressData {
  return {
    mcqAttempts: [],
    flashcardReviews: [],
    questionAttempts: [],
    cameraAttempts: [],
    sm2Data: {},
    dailyStats: {},
    streakDays: 0,
    lastActiveDate: "",
    boardFilter: "all",
  };
}

function trimOldData(data: ProgressData): void {
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000; // 90 days
  data.mcqAttempts = data.mcqAttempts.filter((a) => a.timestamp > cutoff);
  data.flashcardReviews = data.flashcardReviews.filter((r) => r.timestamp > cutoff);
  data.questionAttempts = data.questionAttempts.filter((a) => a.timestamp > cutoff);
  data.cameraAttempts = data.cameraAttempts.filter((a) => a.timestamp > cutoff);
  // Keep only last 90 days of daily stats
  const statsEntries = Object.entries(data.dailyStats);
  const cutoffDate = new Date(cutoff).toISOString().split("T")[0];
  for (const [date] of statsEntries) {
    if (date < cutoffDate) delete data.dailyStats[date];
  }
}

// --- Streak tracking ---

function updateStreak(data: ProgressData): void {
  const today = getToday();
  if (data.lastActiveDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (data.lastActiveDate === yesterdayStr) {
    data.streakDays += 1;
  } else if (data.lastActiveDate !== today) {
    data.streakDays = 1;
  }
  data.lastActiveDate = today;
}

function ensureDailyStats(data: ProgressData): DailyStats {
  const today = getToday();
  if (!data.dailyStats[today]) {
    data.dailyStats[today] = {
      date: today,
      mcqsAnswered: 0,
      mcqsCorrect: 0,
      flashcardsReviewed: 0,
      flashcardsKnown: 0,
      questionsAttempted: 0,
      cameraMarks: 0,
    };
  }
  return data.dailyStats[today];
}

// --- Public API ---

export function recordMCQAttempt(attempt: MCQAttempt): void {
  const data = loadProgress();
  data.mcqAttempts.push(attempt);
  const daily = ensureDailyStats(data);
  daily.mcqsAnswered += 1;
  if (attempt.correct) daily.mcqsCorrect += 1;
  updateStreak(data);
  saveProgress(data);
}

export function recordFlashcardReview(review: FlashcardReview): void {
  const data = loadProgress();
  data.flashcardReviews.push(review);
  const daily = ensureDailyStats(data);
  daily.flashcardsReviewed += 1;
  if (review.knewIt) daily.flashcardsKnown += 1;
  updateStreak(data);
  saveProgress(data);
}

export function recordQuestionAttempt(attempt: QuestionAttempt): void {
  const data = loadProgress();
  data.questionAttempts.push(attempt);
  const daily = ensureDailyStats(data);
  daily.questionsAttempted += 1;
  updateStreak(data);
  saveProgress(data);
}

export function recordCameraAttempt(attempt: CameraAttempt): void {
  const data = loadProgress();
  data.cameraAttempts.push(attempt);
  const daily = ensureDailyStats(data);
  daily.cameraMarks += 1;
  updateStreak(data);
  saveProgress(data);
}

export function updateSM2Data(cardId: string, sm2Card: SM2Card): void {
  const data = loadProgress();
  data.sm2Data[cardId] = sm2Card;
  saveProgress(data);
}

export function getSM2Data(): Record<string, SM2Card> {
  return loadProgress().sm2Data;
}

export function getBoardFilter(): string {
  return loadProgress().boardFilter;
}

export function setBoardFilter(board: string): void {
  const data = loadProgress();
  data.boardFilter = board;
  saveProgress(data);
}

export function getProgressData(): ProgressData {
  return loadProgress();
}

// --- Analytics ---

export function getWeakTopics(subject?: Subject): WeakTopic[] {
  const data = loadProgress();
  const topicMap = new Map<string, { subject: Subject; total: number; correct: number }>();

  for (const attempt of data.mcqAttempts) {
    if (subject && attempt.subject !== subject) continue;
    const key = `${attempt.subject}::${attempt.subtopic}`;
    const existing = topicMap.get(key) || { subject: attempt.subject, total: 0, correct: 0 };
    existing.total += 1;
    if (attempt.correct) existing.correct += 1;
    topicMap.set(key, existing);
  }

  return Array.from(topicMap.entries())
    .map(([key, val]) => ({
      topic: key.split("::")[1],
      subject: val.subject,
      totalAttempts: val.total,
      correctAttempts: val.correct,
      accuracy: val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0,
    }))
    .filter((t) => t.totalAttempts >= 3) // Only show topics with enough data
    .sort((a, b) => a.accuracy - b.accuracy);
}

export function getRepeatedMistakes(subject?: Subject): { questionId: string; subject: Subject; subtopic: string; wrongCount: number; lastWrong: number }[] {
  const data = loadProgress();
  const mistakeMap = new Map<string, { subject: Subject; subtopic: string; wrongCount: number; lastWrong: number }>();

  for (const attempt of data.mcqAttempts) {
    if (subject && attempt.subject !== subject) continue;
    if (!attempt.correct) {
      const existing = mistakeMap.get(attempt.questionId) || {
        subject: attempt.subject,
        subtopic: attempt.subtopic,
        wrongCount: 0,
        lastWrong: 0,
      };
      existing.wrongCount += 1;
      existing.lastWrong = Math.max(existing.lastWrong, attempt.timestamp);
      mistakeMap.set(attempt.questionId, existing);
    }
  }

  return Array.from(mistakeMap.entries())
    .map(([id, val]) => ({ questionId: id, ...val }))
    .filter((m) => m.wrongCount >= 2) // Only repeated mistakes
    .sort((a, b) => b.wrongCount - a.wrongCount);
}

export function getCameraMistakePatterns(subject?: Subject): { pattern: string; count: number }[] {
  const data = loadProgress();
  const patterns = new Map<string, number>();

  for (const attempt of data.cameraAttempts) {
    if (subject && attempt.subject !== subject) continue;
    for (const imp of attempt.improvements) {
      const normalized = imp.toLowerCase().trim();
      patterns.set(normalized, (patterns.get(normalized) || 0) + 1);
    }
  }

  return Array.from(patterns.entries())
    .map(([pattern, count]) => ({ pattern, count }))
    .filter((p) => p.count >= 2)
    .sort((a, b) => b.count - a.count);
}

export function getWeeklyReport(): {
  thisWeek: DailyStats;
  lastWeek: DailyStats;
  streak: number;
  weakTopics: WeakTopic[];
  repeatedMistakes: number;
  cameraPatterns: { pattern: string; count: number }[];
} {
  const data = loadProgress();
  const today = new Date();

  const aggregate = (days: DailyStats[]): DailyStats => ({
    date: "",
    mcqsAnswered: days.reduce((s, d) => s + d.mcqsAnswered, 0),
    mcqsCorrect: days.reduce((s, d) => s + d.mcqsCorrect, 0),
    flashcardsReviewed: days.reduce((s, d) => s + d.flashcardsReviewed, 0),
    flashcardsKnown: days.reduce((s, d) => s + d.flashcardsKnown, 0),
    questionsAttempted: days.reduce((s, d) => s + d.questionsAttempted, 0),
    cameraMarks: days.reduce((s, d) => s + d.cameraMarks, 0),
  });

  const getWeekDays = (weeksAgo: number): DailyStats[] => {
    const days: DailyStats[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - (weeksAgo * 7 + i));
      const key = d.toISOString().split("T")[0];
      if (data.dailyStats[key]) days.push(data.dailyStats[key]);
    }
    return days;
  };

  return {
    thisWeek: aggregate(getWeekDays(0)),
    lastWeek: aggregate(getWeekDays(1)),
    streak: data.streakDays,
    weakTopics: getWeakTopics().slice(0, 5),
    repeatedMistakes: getRepeatedMistakes().length,
    cameraPatterns: getCameraMistakePatterns().slice(0, 5),
  };
}

export function getTotalStats(): {
  totalMCQs: number;
  totalCorrect: number;
  totalFlashcards: number;
  totalQuestions: number;
  totalCameraMarks: number;
  accuracy: number;
  streak: number;
} {
  const data = loadProgress();
  const totalMCQs = data.mcqAttempts.length;
  const totalCorrect = data.mcqAttempts.filter((a) => a.correct).length;
  return {
    totalMCQs,
    totalCorrect,
    totalFlashcards: data.flashcardReviews.length,
    totalQuestions: data.questionAttempts.length,
    totalCameraMarks: data.cameraAttempts.length,
    accuracy: totalMCQs > 0 ? Math.round((totalCorrect / totalMCQs) * 100) : 0,
    streak: data.streakDays,
  };
}

// Get last 7 days of activity for chart
export function getActivityHistory(): DailyStats[] {
  const data = loadProgress();
  const days: DailyStats[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push(
      data.dailyStats[key] || {
        date: key,
        mcqsAnswered: 0,
        mcqsCorrect: 0,
        flashcardsReviewed: 0,
        flashcardsKnown: 0,
        questionsAttempted: 0,
        cameraMarks: 0,
      },
    );
  }
  return days;
}

// Check if a specific MCQ has been answered before
export function getMCQHistory(questionId: string): MCQAttempt[] {
  const data = loadProgress();
  return data.mcqAttempts.filter((a) => a.questionId === questionId);
}

// Get unique MCQ IDs answered per subject
export function getAnsweredMCQIds(subject: Subject): Set<string> {
  const data = loadProgress();
  const ids = new Set<string>();
  for (const a of data.mcqAttempts) {
    if (a.subject === subject) ids.add(a.questionId);
  }
  return ids;
}
