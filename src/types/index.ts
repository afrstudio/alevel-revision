export interface MCQ {
  id: string;
  level: string;
  subject: string;
  boards: string[];
  board_topics: Record<string, string>;
  subtopic: string;
  difficulty: "easy" | "medium" | "hard";
  tier: string | null;
  type: "mcq";
  question: string;
  options: Record<string, string>;
  correct: string;
  explanation: string;
}

export interface OriginalQuestion {
  id: string;
  level: string;
  subject: string;
  boards: string[];
  board_topics: Record<string, string>;
  subtopic: string;
  difficulty: "easy" | "medium" | "hard";
  tier: string | null;
  type: "original-question";
  question_text: string;
  marks: number;
  answer: string;
  marking_criteria: string[];
  diagram: string | null;
  diagram_type: string | null;
}

export interface Flashcard {
  id: string;
  level: string;
  subject: string;
  boards: string[];
  board_topics: Record<string, string>;
  subtopic: string;
  difficulty: "easy" | "medium" | "hard";
  tier: string | null;
  type: "flashcard";
  card_type: string;
  front: string;
  back: string;
}

export interface SubjectData {
  subject: string;
  level: string;
  flashcards: Flashcard[];
  mcqs: MCQ[];
  original_flashcards: Flashcard[];
  original_questions: OriginalQuestion[];
  summary: Record<string, unknown>;
}

export type Subject = "Maths" | "Biology" | "Chemistry";
export type ContentType = "mcq" | "questions" | "flashcards";

export interface MarkingResult {
  score: number;
  totalMarks: number;
  feedback: string;
  criteriaMatched: string[];
  criteriaMissed: string[];
}
