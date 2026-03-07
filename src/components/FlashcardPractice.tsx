"use client";

import { useState, useMemo, useCallback } from "react";
import type { Flashcard } from "@/types/index";
import type { Subject } from "@/types";
import { recordFlashcardReview, updateSM2Data, getSM2Data } from "@/lib/progress";
import { gradeCard, createNewCard, getDueCards, type SM2Card } from "@/lib/sm2";
import RichText from "@/components/RichText";
import { stripLatex } from "@/lib/strip-latex";

interface FlashcardPracticeProps {
  flashcards: Flashcard[];
  subject: Subject;
}

const difficultyColor = { easy: "text-green-600", medium: "text-amber-600", hard: "text-red-600" } as const;
const difficultyDot = { easy: "bg-green-600", medium: "bg-amber-600", hard: "bg-red-600" } as const;

export default function FlashcardPractice({ flashcards, subject }: FlashcardPracticeProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [boardFilter, setBoardFilter] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [reviewedSet, setReviewedSet] = useState<Set<string>>(new Set());
  const [spacedMode, setSpacedMode] = useState(false);
  const [sm2Data, setSm2Data] = useState<Record<string, SM2Card>>(() => getSM2Data());

  const boards = useMemo(() => {
    const set = new Set<string>();
    flashcards.forEach((fc) => fc.boards.forEach((b) => set.add(b)));
    return Array.from(set).sort();
  }, [flashcards]);

  const topics = useMemo(() => {
    const unique = new Set(flashcards.map((fc) => fc.subtopic));
    return Array.from(unique).sort();
  }, [flashcards]);

  const filtered = useMemo(() => {
    return flashcards.filter((fc) => {
      if (boardFilter !== "all" && !fc.boards.includes(boardFilter)) return false;
      if (difficultyFilter !== "all" && fc.difficulty !== difficultyFilter) return false;
      if (topicFilter !== "all" && fc.subtopic !== topicFilter) return false;
      return true;
    });
  }, [flashcards, difficultyFilter, topicFilter, boardFilter]);

  const dueCards = useMemo(() => {
    if (!spacedMode) return filtered;
    return getDueCards(filtered, sm2Data);
  }, [spacedMode, filtered, sm2Data]);

  const activeCards = spacedMode ? dueCards : filtered;
  const currentCard = activeCards[currentIndex] ?? null;

  const handleFlip = () => setIsFlipped((prev) => !prev);

  const goNext = useCallback(() => {
    setIsFlipped(false);
    if (activeCards.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % activeCards.length);
  }, [activeCards.length]);

  const goPrev = useCallback(() => {
    setIsFlipped(false);
    if (activeCards.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
  }, [activeCards.length]);

  const handleAssessment = useCallback((knewIt: boolean) => {
    if (!currentCard) return;
    if (!reviewedSet.has(currentCard.id)) {
      setReviewed((prev) => prev + 1);
      if (knewIt) setKnown((prev) => prev + 1);
      setReviewedSet((prev) => new Set(prev).add(currentCard.id));
    }
    recordFlashcardReview({ cardId: currentCard.id, subject, subtopic: currentCard.subtopic, knewIt, timestamp: Date.now() });
    const existing = sm2Data[currentCard.id] || createNewCard();
    const grade = knewIt ? 4 : 1;
    const updated = gradeCard(existing, grade);
    updateSM2Data(currentCard.id, updated);
    setSm2Data((prev) => ({ ...prev, [currentCard.id]: updated }));
    goNext();
  }, [currentCard, reviewedSet, subject, sm2Data, goNext]);

  const handleFilterChange = (type: "difficulty" | "topic", value: string) => {
    if (type === "difficulty") setDifficultyFilter(value as "all" | "easy" | "medium" | "hard");
    else setTopicFilter(value);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12 md:py-16 text-zinc-400">
        <p className="text-base md:text-lg">No flashcards available.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 md:space-y-5 px-1">
      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Board</label>
            <select
              value={boardFilter}
              onChange={(e) => { setBoardFilter(e.target.value); setCurrentIndex(0); setIsFlipped(false); }}
              className="bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 appearance-none cursor-pointer shadow-sm"
            >
              <option value="all">All</option>
              {boards.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Difficulty</label>
            <select
              value={difficultyFilter}
              onChange={(e) => handleFilterChange("difficulty", e.target.value)}
              className="bg-white border border-zinc-200 w-full rounded-xl px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 appearance-none cursor-pointer shadow-sm"
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Topic</label>
          <select
            value={topicFilter}
            onChange={(e) => handleFilterChange("topic", e.target.value)}
            className="bg-white border border-zinc-200 w-full rounded-xl px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 appearance-none cursor-pointer shadow-sm"
          >
            <option value="all">All Topics</option>
            {topics.map((topic) => <option key={topic} value={topic}>{stripLatex(topic)}</option>)}
          </select>
        </div>
      </div>

      {/* Spaced Repetition Toggle + Score */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => { setSpacedMode((p) => !p); setCurrentIndex(0); setIsFlipped(false); }}
          className={`text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all ${
            spacedMode ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
          }`}
        >
          {spacedMode ? `Smart Review (${dueCards.length} due)` : "Smart Review"}
        </button>
        <span className="text-xs text-zinc-500">Known: {known} / {reviewed}</span>
      </div>

      {/* Card counter */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-zinc-500">Card {activeCards.length > 0 ? currentIndex + 1 : 0} of {activeCards.length}</span>
      </div>

      {/* Progress Bar */}
      {activeCards.length > 0 && (
        <div className="w-full h-1.5 bg-zinc-200/50 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full" style={{ width: `${((currentIndex) / activeCards.length) * 100}%` }} />
        </div>
      )}

      {activeCards.length === 0 ? (
        <div className="text-center py-12 md:py-16 text-zinc-400">
          <p className="text-base md:text-lg">
            {spacedMode ? "No cards due for review! Come back later." : "No flashcards match the current filters."}
          </p>
        </div>
      ) : (
        <>
          {/* Flashcard - 3D flip */}
          <div
            className="relative w-full cursor-pointer active:scale-[0.97] transition-transform perspective-1000"
            onClick={handleFlip}
          >
            <div
              className={`relative w-full min-h-[280px] md:min-h-[360px] preserve-3d transition-transform duration-500 ${isFlipped ? "rotate-y-180" : ""}`}
              style={{ transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)" }}
            >
              {/* Front */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white border border-zinc-200 rounded-2xl p-5 md:p-8 shadow-sm backface-hidden">
                <span className="absolute top-3.5 left-4 text-[10px] text-zinc-400 uppercase tracking-widest font-medium">Question</span>
                {currentCard?.difficulty && (
                  <span className="absolute top-3.5 right-4 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${difficultyDot[currentCard.difficulty]}`} />
                    <span className={`text-[11px] font-medium capitalize ${difficultyColor[currentCard.difficulty]}`}>{currentCard.difficulty}</span>
                  </span>
                )}
                <RichText className="text-[15px] md:text-lg text-zinc-900 text-center leading-relaxed mt-4 px-1">{currentCard?.front || ""}</RichText>
                <p className="absolute bottom-3.5 text-[10px] text-zinc-300 uppercase tracking-widest">Tap to flip</p>
              </div>

              {/* Back */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-50 border border-indigo-200 rounded-2xl p-5 md:p-8 shadow-sm backface-hidden rotate-y-180">
                <span className="absolute top-3.5 left-4 text-[10px] text-indigo-500 uppercase tracking-widest font-medium bg-white px-3 py-1 rounded-md shadow-sm">Answer</span>
                <div className="w-full flex items-center justify-center mt-4 mb-6">
                  <RichText className="text-[15px] md:text-lg text-zinc-900 text-center leading-relaxed overflow-y-auto max-h-[220px] md:max-h-[300px] w-full px-1">{currentCard?.back || ""}</RichText>
                </div>
                <p className="absolute bottom-3.5 text-[10px] text-indigo-300 uppercase tracking-widest">Tap to flip</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2.5">
            <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="bg-white border border-zinc-200 rounded-xl min-h-[48px] text-[13px] text-zinc-600 font-medium flex-1 hover:bg-zinc-50 active:scale-95 transition-all shadow-sm">
              Previous
            </button>
            <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="bg-white border border-zinc-200 rounded-xl min-h-[48px] text-[13px] text-zinc-600 font-medium flex-1 hover:bg-zinc-50 active:scale-95 transition-all shadow-sm">
              Next
            </button>
          </div>

          {/* Assessment */}
          <div className="flex gap-2.5">
            <button
              onClick={(e) => { e.stopPropagation(); handleAssessment(true); }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl min-h-[52px] text-[14px] font-semibold flex-1 hover:bg-emerald-100 active:scale-95 transition-all"
            >
              Knew it
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleAssessment(false); }}
              className="bg-red-50 border border-red-200 text-red-700 rounded-xl min-h-[52px] text-[14px] font-semibold flex-1 hover:bg-red-100 active:scale-95 transition-all"
            >
              Review
            </button>
          </div>
        </>
      )}
    </div>
  );
}
