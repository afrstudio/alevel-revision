"use client";

import { useState, useMemo } from "react";
import type { Flashcard } from "@/types/index";

interface FlashcardPracticeProps {
  flashcards: Flashcard[];
}

export default function FlashcardPractice({ flashcards }: FlashcardPracticeProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [reviewedSet, setReviewedSet] = useState<Set<string>>(new Set());

  const topics = useMemo(() => {
    const unique = new Set(flashcards.map((fc) => fc.subtopic));
    return Array.from(unique).sort();
  }, [flashcards]);

  const filtered = useMemo(() => {
    return flashcards.filter((fc) => {
      if (difficultyFilter !== "all" && fc.difficulty !== difficultyFilter) return false;
      if (topicFilter !== "all" && fc.subtopic !== topicFilter) return false;
      return true;
    });
  }, [flashcards, difficultyFilter, topicFilter]);

  const currentCard = filtered[currentIndex] ?? null;

  const handleFlip = () => setIsFlipped((prev) => !prev);

  const goNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filtered.length);
  };

  const goPrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
  };

  const handleAssessment = (knewIt: boolean) => {
    if (!currentCard) return;
    if (!reviewedSet.has(currentCard.id)) {
      setReviewed((prev) => prev + 1);
      if (knewIt) setKnown((prev) => prev + 1);
      setReviewedSet((prev) => new Set(prev).add(currentCard.id));
    }
    goNext();
  };

  const handleFilterChange = (type: "difficulty" | "topic", value: string) => {
    if (type === "difficulty") {
      setDifficultyFilter(value as "all" | "easy" | "medium" | "hard");
    } else {
      setTopicFilter(value);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12 md:py-16 text-gray-400">
        <p className="text-base md:text-lg">No flashcards available.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 md:space-y-6 px-1">
      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:gap-4">
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <label className="text-sm text-gray-400 font-medium">Difficulty</label>
          <select
            value={difficultyFilter}
            onChange={(e) => handleFilterChange("difficulty", e.target.value)}
            className="w-full md:w-auto bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2.5 md:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] md:min-h-0"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 w-full md:w-auto">
          <label className="text-sm text-gray-400 font-medium">Topic</label>
          <select
            value={topicFilter}
            onChange={(e) => handleFilterChange("topic", e.target.value)}
            className="w-full md:w-auto bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2.5 md:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] md:min-h-0"
          >
            <option value="all">All Topics</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Score Counter */}
      <div className="flex items-center justify-between">
        <p className="text-xs md:text-sm text-gray-400">
          Card {filtered.length > 0 ? currentIndex + 1 : 0} of {filtered.length}
        </p>
        <p className="text-xs md:text-sm font-medium text-gray-300">
          Known: <span className="text-green-400">{known}</span> / Reviewed:{" "}
          <span className="text-blue-400">{reviewed}</span>
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 md:py-16 text-gray-400">
          <p className="text-base md:text-lg">No flashcards match the current filters.</p>
        </div>
      ) : (
        <>
          {/* Flashcard */}
          <div
            className="relative w-full cursor-pointer active:scale-[0.98] transition-transform"
            style={{ perspective: "1200px" }}
            onClick={handleFlip}
          >
            <div
              className="relative w-full min-h-[280px] md:min-h-[360px]"
              style={{
                transformStyle: "preserve-3d",
                transition: "transform 0.6s",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-gray-700 bg-gray-800 p-5 md:p-8 shadow-lg"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="absolute top-3 left-3 md:top-4 md:left-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Question
                </span>
                <span
                  className={`absolute top-3 right-3 md:top-4 md:right-4 text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                    currentCard?.difficulty === "easy"
                      ? "bg-green-900/50 text-green-400"
                      : currentCard?.difficulty === "medium"
                      ? "bg-yellow-900/50 text-yellow-400"
                      : "bg-red-900/50 text-red-400"
                  }`}
                >
                  {currentCard?.difficulty}
                </span>
                <p className="text-base md:text-lg text-gray-100 text-center leading-relaxed mt-4">
                  {currentCard?.front}
                </p>
                <p className="absolute bottom-3 md:bottom-4 text-xs text-gray-600">
                  Tap to flip
                </p>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-gray-700 bg-gray-800 p-5 md:p-8 shadow-lg"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <span className="absolute top-3 left-3 md:top-4 md:left-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Answer
                </span>
                <div className="w-full flex items-center justify-center mt-4 mb-6">
                  <p className="text-base md:text-lg text-gray-100 text-center leading-relaxed overflow-y-auto max-h-[250px] md:max-h-[320px] w-full px-1">
                    {currentCard?.back}
                  </p>
                </div>
                <p className="absolute bottom-3 md:bottom-4 text-xs text-gray-600">
                  Tap to flip back
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-center md:gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="w-full md:w-auto px-5 py-2.5 min-h-[48px] rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-700 active:scale-[0.98] transition-all"
            >
              Previous
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="w-full md:w-auto px-5 py-2.5 min-h-[48px] rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-700 active:scale-[0.98] transition-all"
            >
              Next
            </button>
          </div>

          {/* Self-Assessment Buttons */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-center md:gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAssessment(true);
              }}
              className="w-full md:w-auto md:flex-1 md:max-w-[200px] px-6 py-2.5 min-h-[48px] rounded-lg bg-green-600/20 border border-green-700 text-green-400 text-sm font-medium hover:bg-green-600/30 active:scale-[0.98] transition-all"
            >
              I knew it
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAssessment(false);
              }}
              className="w-full md:w-auto md:flex-1 md:max-w-[200px] px-6 py-2.5 min-h-[48px] rounded-lg bg-red-600/20 border border-red-700 text-red-400 text-sm font-medium hover:bg-red-600/30 active:scale-[0.98] transition-all"
            >
              Need to review
            </button>
          </div>
        </>
      )}
    </div>
  );
}
