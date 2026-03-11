"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { Flashcard } from "@/types/index";
import type { Subject } from "@/types";
import { recordFlashcardReview, updateSM2Data, getSM2Data } from "@/lib/progress";
import { gradeCard, createNewCard, getDueCards, type SM2Card } from "@/lib/sm2";
import RichText from "@/components/RichText";
import { stripLatex } from "@/lib/strip-latex";
import { findBestTopicMatch } from "@/lib/topic-normalize";

function useAiExplain(subject: string) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const explain = useCallback(async (question: string, answer: string, topic: string) => {
    if (loading || explanation) return;
    setLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          question: stripLatex(question),
          correctAnswer: stripLatex(answer),
          selectedAnswer: "I didn't know the answer",
          topic,
        }),
      });
      const data = await res.json();
      setExplanation(data.explanation || "Could not generate explanation.");
    } catch {
      setExplanation("Could not connect to AI right now.");
    } finally {
      setLoading(false);
    }
  }, [subject, loading, explanation]);

  const reset = useCallback(() => { setExplanation(null); setLoading(false); }, []);

  return { explanation, loading, explain, reset };
}

interface FlashcardPracticeProps {
  flashcards: Flashcard[];
  subject: Subject;
  initialTopic?: string;
}

const difficultyColor = { easy: "text-green-600", medium: "text-amber-600", hard: "text-red-600" } as const;
const difficultyDot = { easy: "bg-green-600", medium: "bg-amber-600", hard: "bg-red-600" } as const;

export default function FlashcardPractice({ flashcards, subject, initialTopic }: FlashcardPracticeProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [topicFilter, setTopicFilter] = useState<string>(() => {
    if (!initialTopic) return "all";
    // Check if exact match exists first
    const allTopics = Array.from(new Set(flashcards.map((fc) => fc.subtopic)));
    if (allTopics.includes(initialTopic)) return initialTopic;
    // Fuzzy match
    const match = findBestTopicMatch(initialTopic, allTopics);
    return match || "all";
  });
  const [boardFilter, setBoardFilter] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [reviewedSet, setReviewedSet] = useState<Set<string>>(new Set());
  const [spacedMode, setSpacedMode] = useState(false);
  const [sm2Data, setSm2Data] = useState<Record<string, SM2Card>>(() => getSM2Data());
  const [showSummary, setShowSummary] = useState(false);
  const [sessionTopicStats, setSessionTopicStats] = useState<Map<string, { known: number; total: number }>>(new Map());
  const aiExplain = useAiExplain(subject);

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
    aiExplain.reset();
    if (activeCards.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % activeCards.length);
  }, [activeCards.length, aiExplain]);

  const goPrev = useCallback(() => {
    setIsFlipped(false);
    aiExplain.reset();
    if (activeCards.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
  }, [activeCards.length, aiExplain]);

  const handleAssessment = useCallback((grade: 1 | 3 | 4) => {
    if (!currentCard) return;
    const knewIt = grade >= 3;
    if (!reviewedSet.has(currentCard.id)) {
      setReviewed((prev) => prev + 1);
      if (knewIt) setKnown((prev) => prev + 1);
      setReviewedSet((prev) => new Set(prev).add(currentCard.id));
    }
    recordFlashcardReview({ cardId: currentCard.id, subject, subtopic: currentCard.subtopic, knewIt, timestamp: Date.now() });
    const existing = sm2Data[currentCard.id] || createNewCard();
    const updated = gradeCard(existing, grade);
    updateSM2Data(currentCard.id, updated);
    setSm2Data((prev) => ({ ...prev, [currentCard.id]: updated }));
    // Track per-topic stats
    setSessionTopicStats((prev) => {
      const next = new Map(prev);
      const existing = next.get(currentCard.subtopic) || { known: 0, total: 0 };
      next.set(currentCard.subtopic, { known: existing.known + (knewIt ? 1 : 0), total: existing.total + 1 });
      return next;
    });
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
          onClick={() => { setSpacedMode((p) => !p); setCurrentIndex(0); setIsFlipped(false); aiExplain.reset(); }}
          className={`text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all ${
            spacedMode
              ? dueCards.length > 0
                ? "bg-zinc-900 text-white"
                : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
          }`}
        >
          {spacedMode
            ? dueCards.length > 0
              ? `${dueCards.length} card${dueCards.length !== 1 ? "s" : ""} due`
              : "All caught up"
            : (() => {
                const totalDue = getDueCards(filtered, sm2Data).length;
                return totalDue > 0 ? `Smart Review (${totalDue} due)` : "Smart Review";
              })()
          }
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
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleAssessment(4); }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl min-h-[52px] text-[13px] font-semibold flex-1 hover:bg-emerald-100 active:scale-95 transition-all"
            >
              Knew it
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleAssessment(3); }}
              className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl min-h-[52px] text-[13px] font-semibold flex-1 hover:bg-amber-100 active:scale-95 transition-all"
            >
              Still learning
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleAssessment(1); }}
              className="bg-red-50 border border-red-200 text-red-700 rounded-xl min-h-[52px] text-[13px] font-semibold flex-1 hover:bg-red-100 active:scale-95 transition-all"
            >
              Review
            </button>
          </div>

          {/* AI Explain — shows when card is flipped */}
          {isFlipped && currentCard && (
            <div className="space-y-2">
              {!aiExplain.explanation && (
                <button
                  onClick={(e) => { e.stopPropagation(); aiExplain.explain(currentCard.front, currentCard.back, currentCard.subtopic); }}
                  disabled={aiExplain.loading}
                  className="w-full flex items-center justify-center gap-2 min-h-[44px] bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[13px] font-medium transition-all active:scale-95 disabled:opacity-60"
                >
                  {aiExplain.loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
                      Explain this to me
                    </>
                  )}
                </button>
              )}
              {aiExplain.explanation && (
                <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-2 fade-in">
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">AI Tutor</span>
                  </div>
                  <RichText className="text-[13px] text-zinc-700 leading-relaxed">{aiExplain.explanation}</RichText>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Session summary button + modal */}
      {reviewed >= 3 && !showSummary && (
        <button
          onClick={() => setShowSummary(true)}
          className="w-full min-h-[44px] bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl text-[13px] font-medium transition-all active:scale-95"
        >
          View session summary ({reviewed} cards, {reviewed > 0 ? Math.round((known / reviewed) * 100) : 0}% known)
        </button>
      )}

      {showSummary && (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 space-y-4 fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-zinc-900">Session Summary</h3>
            <button onClick={() => setShowSummary(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-zinc-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-zinc-900">{reviewed}</p>
              <p className="text-[11px] text-zinc-500">Reviewed</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-emerald-600">{known}</p>
              <p className="text-[11px] text-emerald-600">Known</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-zinc-900">{reviewed > 0 ? Math.round((known / reviewed) * 100) : 0}%</p>
              <p className="text-[11px] text-zinc-500">Retention</p>
            </div>
          </div>
          {sessionTopicStats.size > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">By topic</p>
              {Array.from(sessionTopicStats.entries())
                .sort(([, a], [, b]) => (a.known / a.total) - (b.known / b.total))
                .map(([topic, stats]) => {
                  const ret = Math.round((stats.known / stats.total) * 100);
                  return (
                    <div key={topic} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] text-zinc-700 truncate">{topic}</span>
                          <span className={`text-[11px] font-medium ${ret < 50 ? "text-red-600" : ret < 75 ? "text-amber-600" : "text-emerald-600"}`}>
                            {stats.known}/{stats.total}
                          </span>
                        </div>
                        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${ret < 50 ? "bg-red-500" : ret < 75 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${ret}%` }} />
                        </div>
                      </div>
                      {ret < 70 && (
                        <Link
                          href={`/mcqs?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}`}
                          className="text-[11px] text-indigo-600 font-medium hover:text-indigo-800 shrink-0"
                        >
                          MCQs
                        </Link>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* Retry weak topics CTA */}
          {(() => {
            const weakTopics = Array.from(sessionTopicStats.entries())
              .filter(([, s]) => Math.round((s.known / s.total) * 100) < 70)
              .map(([t]) => t);
            if (weakTopics.length === 0) return null;
            const firstWeak = weakTopics[0];
            return (
              <Link
                href={`/flashcards?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(firstWeak)}`}
                className="block w-full text-center min-h-[48px] py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[13px] font-medium transition-all active:scale-95"
              >
                Review your weakest topic: {firstWeak}
              </Link>
            );
          })()}
        </div>
      )}
    </div>
  );
}
