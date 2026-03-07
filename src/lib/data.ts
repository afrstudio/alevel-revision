import type { SubjectData, Subject, MCQ, OriginalQuestion, Flashcard } from "@/types";

import mathsData from "@/data/A-Level-Maths.json";
import biologyData from "@/data/A-Level-Biology.json";
import chemistryData from "@/data/A-Level-Chemistry.json";

const dataMap: Record<Subject, SubjectData> = {
  Maths: mathsData as unknown as SubjectData,
  Biology: biologyData as unknown as SubjectData,
  Chemistry: chemistryData as unknown as SubjectData,
};

export function getSubjectData(subject: Subject): SubjectData {
  return dataMap[subject];
}

export function getMCQs(subject: Subject): MCQ[] {
  return dataMap[subject].mcqs;
}

export function getOriginalQuestions(subject: Subject): OriginalQuestion[] {
  return dataMap[subject].original_questions;
}

export function getFlashcards(subject: Subject): Flashcard[] {
  const data = dataMap[subject];
  // Merge original_flashcards with generated flashcards, deduplicating by id
  const all = [...data.flashcards];
  const existingIds = new Set(all.map((f) => f.id));
  if (data.original_flashcards) {
    for (const fc of data.original_flashcards) {
      if (!existingIds.has(fc.id)) {
        all.push(fc);
        existingIds.add(fc.id);
      }
    }
  }
  return all;
}

export function getTopics(subject: Subject): string[] {
  const data = dataMap[subject];
  const topics = new Set<string>();
  data.mcqs.forEach((q) => {
    Object.values(q.board_topics).forEach((t) => topics.add(t));
  });
  data.original_questions.forEach((q) => {
    Object.values(q.board_topics).forEach((t) => topics.add(t));
  });
  return Array.from(topics).sort();
}

export function getSubtopics(subject: Subject, topic: string): string[] {
  const data = dataMap[subject];
  const subtopics = new Set<string>();
  const allItems = [...data.mcqs, ...data.original_questions, ...data.flashcards];
  allItems.forEach((item) => {
    const matchesTopic = Object.values(item.board_topics).includes(topic);
    if (matchesTopic && item.subtopic) {
      subtopics.add(item.subtopic);
    }
  });
  return Array.from(subtopics).sort();
}

// Content counts for the home page
export function getContentCounts(): Record<Subject, { mcqs: number; questions: number; flashcards: number }> {
  const result = {} as Record<Subject, { mcqs: number; questions: number; flashcards: number }>;
  for (const subject of ["Maths", "Biology", "Chemistry"] as Subject[]) {
    result[subject] = {
      mcqs: getMCQs(subject).length,
      questions: getOriginalQuestions(subject).length,
      flashcards: getFlashcards(subject).length,
    };
  }
  return result;
}
