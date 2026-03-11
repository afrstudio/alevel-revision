"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { MCQ } from "@/types/index";
import type { Subject } from "@/types";
import Link from "next/link";
import { recordMCQAttempt, getAnsweredMCQIds, getPreviouslyWrongMCQIds, getWeakTopics } from "@/lib/progress";
import RichText from "@/components/RichText";
import { stripLatex } from "@/lib/strip-latex";
import ExamTimer, { TimerToggle } from "@/components/ExamTimer";
import { getCorrectMessage, getWrongMessage } from "@/lib/banter";
import { findBestTopicMatch } from "@/lib/topic-normalize";

interface MCQPracticeProps {
  mcqs: MCQ[];
  subject: Subject;
  initialTopic?: string;
  adaptiveMode?: boolean;
}

const difficultyConfig: Record<string, { label: string; classes: string; activeClasses: string }> = {
  easy: {
    label: "Easy",
    classes: "text-green-600 bg-green-50",
    activeClasses: "text-green-600 bg-green-50 ring-1 ring-green-300",
  },
  medium: {
    label: "Medium",
    classes: "text-amber-600 bg-amber-50",
    activeClasses: "text-amber-600 bg-amber-50 ring-1 ring-amber-300",
  },
  hard: {
    label: "Hard",
    classes: "text-red-600 bg-red-50",
    activeClasses: "text-red-600 bg-red-50 ring-1 ring-red-300",
  },
};

const optionLabels = ["A", "B", "C", "D"];

function getRandomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

function seededShuffle<T>(arr: T[], seed: string): T[] {
  const result = [...arr];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  for (let i = result.length - 1; i > 0; i--) {
    hash = ((hash << 5) - hash + i) | 0;
    const j = Math.abs(hash) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function MCQPractice({ mcqs, subject, initialTopic, adaptiveMode }: MCQPracticeProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>(() => {
    if (!initialTopic) return "all";
    const allTopics = Array.from(new Set(mcqs.map((m) => m.subtopic)));
    if (allTopics.includes(initialTopic)) return initialTopic;
    const match = findBestTopicMatch(initialTopic, allTopics);
    return match || "all";
  });
  const [boardFilter, setBoardFilter] = useState<string>("all");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [sessionTopicStats, setSessionTopicStats] = useState<Map<string, { correct: number; total: number }>>(new Map());
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiExplainLoading, setAiExplainLoading] = useState(false);

  const boards = useMemo(() => {
    const set = new Set<string>();
    mcqs.forEach((m) => m.boards.forEach((b) => set.add(b)));
    return Array.from(set).sort();
  }, [mcqs]);

  const filteredMcqs = useMemo(() => {
    let filtered = mcqs;
    if (boardFilter !== "all") filtered = filtered.filter((m) => m.boards.includes(boardFilter));
    if (difficultyFilter !== "all") filtered = filtered.filter((m) => m.difficulty === difficultyFilter);
    if (topicFilter !== "all") filtered = filtered.filter((m) => m.subtopic === topicFilter);
    return filtered;
  }, [mcqs, difficultyFilter, topicFilter, boardFilter]);

  const topics = useMemo(() => {
    let base = mcqs;
    if (difficultyFilter !== "all") base = base.filter((m) => m.difficulty === difficultyFilter);
    const set = new Set(base.map((m) => m.subtopic));
    return Array.from(set).sort();
  }, [mcqs, difficultyFilter]);

  const answeredBefore = useMemo(() => getAnsweredMCQIds(subject), [subject]);
  const previouslyWrong = useMemo(() => getPreviouslyWrongMCQIds(subject), [subject]);

  // In adaptive mode, prioritize previously-wrong questions and weak topic questions
  const orderedMcqs = useMemo(() => {
    if (!adaptiveMode) return filteredMcqs;
    const weakTopicNames = new Set(getWeakTopics(subject).map((t) => t.topic));
    return [...filteredMcqs].sort((a, b) => {
      const aWrong = previouslyWrong.get(a.id) || 0;
      const bWrong = previouslyWrong.get(b.id) || 0;
      const aWeak = weakTopicNames.has(a.subtopic) ? 1 : 0;
      const bWeak = weakTopicNames.has(b.subtopic) ? 1 : 0;
      // Sort by: wrong count desc, then weak topic, then unseen first
      if (bWrong !== aWrong) return bWrong - aWrong;
      if (bWeak !== aWeak) return bWeak - aWeak;
      const aSeen = answeredBefore.has(a.id) ? 1 : 0;
      const bSeen = answeredBefore.has(b.id) ? 1 : 0;
      return aSeen - bSeen;
    });
  }, [filteredMcqs, adaptiveMode, previouslyWrong, answeredBefore, subject]);

  const activePool = adaptiveMode ? orderedMcqs : filteredMcqs;
  const currentQuestion: MCQ | null = activePool.length > 0 ? activePool[currentIndex % activePool.length] : null;
  const hasAnswered = selectedOption !== null;

  const handleOptionClick = useCallback((key: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(key);
    setQuestionsAnswered((prev) => prev + 1);
    const isCorrect = currentQuestion ? key === currentQuestion.correct : false;
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      setWrongStreak(0);
      setFeedbackMsg(getCorrectMessage(newStreak));
    } else {
      const newStreak = wrongStreak + 1;
      setWrongStreak(newStreak);
      setCorrectStreak(0);
      setFeedbackMsg(getWrongMessage(newStreak));
    }
    if (currentQuestion) {
      recordMCQAttempt({
        questionId: currentQuestion.id, subject, subtopic: currentQuestion.subtopic,
        difficulty: currentQuestion.difficulty, correct: isCorrect, selectedAnswer: key,
        correctAnswer: currentQuestion.correct, timestamp: Date.now(),
      });
      // Track per-topic stats for session summary
      setSessionTopicStats((prev) => {
        const next = new Map(prev);
        const existing = next.get(currentQuestion.subtopic) || { correct: 0, total: 0 };
        next.set(currentQuestion.subtopic, {
          correct: existing.correct + (isCorrect ? 1 : 0),
          total: existing.total + 1,
        });
        return next;
      });
    }
  }, [selectedOption, currentQuestion, subject, correctStreak, wrongStreak]);

  const handleNext = useCallback(() => {
    if (activePool.length <= 1) { setSelectedOption(null); return; }
    if (adaptiveMode) {
      // In adaptive mode, go sequentially through prioritized list
      setCurrentIndex((prev) => (prev + 1) % activePool.length);
    } else {
      let next = getRandomIndex(activePool.length);
      while (next === currentIndex % activePool.length) next = getRandomIndex(activePool.length);
      setCurrentIndex(next);
    }
    setSelectedOption(null);
    setAiExplanation(null);
    setAiExplainLoading(false);
  }, [activePool.length, currentIndex, adaptiveMode]);

  const handleExplainWhy = useCallback(async () => {
    if (!currentQuestion || aiExplainLoading || aiExplanation) return;
    setAiExplainLoading(true);
    try {
      const selectedText = selectedOption ? currentQuestion.options[selectedOption] || selectedOption : "";
      const correctText = currentQuestion.options[currentQuestion.correct] || currentQuestion.correct;
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          question: stripLatex(currentQuestion.question),
          selectedAnswer: stripLatex(selectedText),
          correctAnswer: stripLatex(correctText),
          topic: currentQuestion.subtopic,
          existingExplanation: currentQuestion.explanation ? stripLatex(currentQuestion.explanation).slice(0, 500) : "",
        }),
      });
      const data = await res.json();
      setAiExplanation(data.explanation || "Could not generate explanation.");
    } catch {
      setAiExplanation("Could not connect to AI. Review the explanation above.");
    } finally {
      setAiExplainLoading(false);
    }
  }, [currentQuestion, selectedOption, subject, aiExplainLoading, aiExplanation]);

  const handleFilterChange = (setter: (val: string) => void, value: string) => {
    setter(value);
    setSelectedOption(null);
    setCurrentIndex(0);
    setQuestionsAnswered(0);
    setCorrectCount(0);
    setCorrectStreak(0);
    setWrongStreak(0);
    setShowSummary(false);
    setSessionTopicStats(new Map());
    setAiExplanation(null);
    setAiExplainLoading(false);
  };

  const shuffledOptions = useMemo(() => {
    if (!currentQuestion) return [];
    return seededShuffle(Object.entries(currentQuestion.options), currentQuestion.id);
  }, [currentQuestion]);

  const remappedExplanation = useMemo(() => {
    if (!currentQuestion?.explanation || shuffledOptions.length === 0) return "";
    const keyToNewLabel: Record<string, string> = {};
    shuffledOptions.forEach(([origKey], newIdx) => { keyToNewLabel[origKey] = optionLabels[newIdx]; });
    let text = currentQuestion.explanation;
    const placeholder: Record<string, string> = {};
    Object.entries(keyToNewLabel).forEach(([orig, newLabel]) => { placeholder[orig] = `__OPT_${newLabel}__`; });
    Object.entries(placeholder).forEach(([orig, ph]) => {
      text = text.replace(new RegExp(`\\b${orig}\\b(?=\\s+(?:is|was|would|could|because|correct|wrong|incorrect))`, "g"), ph);
    });
    Object.values(placeholder).forEach((ph) => {
      const label = ph.replace("__OPT_", "").replace("__", "");
      text = text.replace(new RegExp(ph, "g"), label);
    });
    return text;
  }, [currentQuestion, shuffledOptions]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (!hasAnswered && shuffledOptions.length > 0) {
        const idx = parseInt(e.key) - 1;
        if (idx >= 0 && idx < shuffledOptions.length) { handleOptionClick(shuffledOptions[idx][0]); return; }
        const letterIdx = ["a", "b", "c", "d"].indexOf(e.key.toLowerCase());
        if (letterIdx >= 0 && letterIdx < shuffledOptions.length) { handleOptionClick(shuffledOptions[letterIdx][0]); return; }
      }
      if (hasAnswered && (e.key === "Enter" || e.key === " " || e.key === "ArrowRight")) { e.preventDefault(); handleNext(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hasAnswered, shuffledOptions, handleOptionClick, handleNext]);

  const difficulties = ["all", "easy", "medium", "hard"] as const;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 fade-in">
      {/* Adaptive mode banner */}
      {adaptiveMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
          <p className="text-[13px] text-amber-700 font-medium">Adaptive mode — prioritising questions you&apos;ve struggled with</p>
        </div>
      )}
      {/* Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {difficulties.map((d) => {
            const isActive = difficultyFilter === d;
            let pillClasses = "px-3.5 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer active:scale-[0.98] focus:outline-none ";
            if (d === "all") {
              pillClasses += isActive ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200";
            } else {
              const cfg = difficultyConfig[d];
              pillClasses += isActive ? cfg.activeClasses : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200";
            }
            return (
              <button key={d} onClick={() => handleFilterChange(setDifficultyFilter, d)} className={pillClasses}>
                {d === "all" ? "All" : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <select
            value={boardFilter}
            onChange={(e) => handleFilterChange(setBoardFilter, e.target.value)}
            className="bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
          >
            <option value="all">All Boards</option>
            {boards.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={topicFilter}
            onChange={(e) => handleFilterChange(setTopicFilter, e.target.value)}
            className="bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-900 w-full focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
          >
            <option value="all">All Topics</option>
            {topics.map((t) => <option key={t} value={t}>{stripLatex(t)}</option>)}
          </select>
        </div>
      </div>

      {/* Progress + Timer Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-zinc-400 tracking-wide">
          Question {activePool.length > 0 ? questionsAnswered + 1 : 0} of {activePool.length}
          {currentQuestion && answeredBefore.has(currentQuestion.id) && (
            <span className="ml-1.5 text-indigo-500" title="You've attempted this before">(seen)</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {questionsAnswered > 0 && (
            <span className="text-[11px] text-zinc-400 tracking-wide">{correctCount}/{questionsAnswered} correct</span>
          )}
          <TimerToggle enabled={timerEnabled} onToggle={setTimerEnabled} />
        </div>
      </div>

      {/* Exam Timer - 90 seconds per MCQ */}
      {currentQuestion && (
        <ExamTimer
          duration={90}
          onTimeUp={() => {}}
          resetKey={currentQuestion.id}
          enabled={timerEnabled}
        />
      )}

      {/* Session summary button */}
      {questionsAnswered >= 3 && !showSummary && (
        <button
          onClick={() => setShowSummary(true)}
          className="w-full min-h-[44px] bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl text-[13px] font-medium transition-all active:scale-95"
        >
          View session summary ({questionsAnswered} questions, {Math.round((correctCount / questionsAnswered) * 100)}% accuracy)
        </button>
      )}

      {/* Session Summary Modal */}
      {showSummary && (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 md:p-5 space-y-4 fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-zinc-900">Session Summary</h3>
            <button onClick={() => setShowSummary(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-zinc-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-zinc-900">{questionsAnswered}</p>
              <p className="text-[11px] text-zinc-500">Answered</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-emerald-600">{correctCount}</p>
              <p className="text-[11px] text-emerald-600">Correct</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-zinc-900">{Math.round((correctCount / questionsAnswered) * 100)}%</p>
              <p className="text-[11px] text-zinc-500">Accuracy</p>
            </div>
          </div>

          {sessionTopicStats.size > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">By topic</p>
              {Array.from(sessionTopicStats.entries())
                .sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total))
                .map(([topic, stats]) => {
                  const acc = Math.round((stats.correct / stats.total) * 100);
                  return (
                    <div key={topic} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] text-zinc-700 truncate">{topic}</span>
                          <span className={`text-[11px] font-medium ${acc < 50 ? "text-red-600" : acc < 75 ? "text-amber-600" : "text-emerald-600"}`}>
                            {stats.correct}/{stats.total} ({acc}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${acc < 50 ? "bg-red-500" : acc < 75 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${acc}%` }} />
                        </div>
                      </div>
                      {acc < 70 && (
                        <Link
                          href={`/flashcards?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}`}
                          className="text-[11px] text-indigo-600 font-medium hover:text-indigo-800 shrink-0"
                        >
                          Study
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
              .filter(([, s]) => Math.round((s.correct / s.total) * 100) < 70)
              .map(([t]) => t);
            if (weakTopics.length === 0) return null;
            const firstWeak = weakTopics[0];
            return (
              <Link
                href={`/mcqs?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(firstWeak)}&mode=weak`}
                className="block w-full text-center min-h-[48px] py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[13px] font-medium transition-all active:scale-95"
              >
                Retry your weakest topic: {firstWeak}
              </Link>
            );
          })()}
        </div>
      )}

      {/* Question Card */}
      {currentQuestion ? (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 md:p-5 space-y-4 fade-in">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[11px] px-2 py-0.5 rounded-lg font-medium ${difficultyConfig[currentQuestion.difficulty]?.classes || "bg-zinc-50 text-zinc-400"}`}>
              {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
            </span>
            <span className="bg-zinc-100 text-zinc-500 text-[11px] px-2 py-0.5 rounded-lg">{currentQuestion.subtopic}</span>
            {previouslyWrong.has(currentQuestion.id) && (
              <span className="text-[11px] px-2 py-0.5 rounded-lg font-medium bg-amber-50 text-amber-600 border border-amber-200">
                Wrong before ({previouslyWrong.get(currentQuestion.id)}x)
              </span>
            )}
          </div>

          <RichText className="text-[15px] text-zinc-900 leading-relaxed">{currentQuestion.question}</RichText>

          <div className="space-y-2.5">
            {shuffledOptions.map(([key, value], idx) => {
              const isSelected = selectedOption === key;
              const isCorrect = key === currentQuestion.correct;
              const showCorrect = hasAnswered && isCorrect;
              const showWrong = hasAnswered && isSelected && !isCorrect;

              let optionClasses = "w-full text-left flex items-center gap-3 bg-white rounded-xl p-3.5 min-h-[52px] border transition-all duration-150 ";
              let letterClasses = "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-semibold transition-all duration-150 ";

              if (showCorrect) {
                optionClasses += "bg-emerald-50 border-emerald-200 ";
                letterClasses += "bg-emerald-600 text-white ";
              } else if (showWrong) {
                optionClasses += "bg-red-50 border-red-200 ";
                letterClasses += "bg-red-600 text-white ";
              } else if (hasAnswered) {
                optionClasses += "opacity-50 cursor-default border-zinc-100 ";
                letterClasses += "bg-zinc-100 text-zinc-400 ";
              } else {
                optionClasses += "border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 cursor-pointer active:scale-[0.97] ";
                letterClasses += "bg-zinc-100 text-zinc-500 ";
              }

              return (
                <button key={key} onClick={() => handleOptionClick(key)} disabled={hasAnswered} className={optionClasses}>
                  <span className={letterClasses}>{optionLabels[idx] || key}</span>
                  <RichText as="span" className={`text-sm ${showCorrect ? "text-emerald-700" : showWrong ? "text-red-700" : "text-zinc-900"}`}>
                    {value}
                  </RichText>
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <div className="space-y-3 fade-in">
              {selectedOption === currentQuestion.correct ? (
                <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {feedbackMsg}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  {feedbackMsg}
                </div>
              )}
              {remappedExplanation && (
                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3.5">
                  <RichText className="text-[13px] text-zinc-500 leading-relaxed">{remappedExplanation}</RichText>
                </div>
              )}
              {/* AI Explain + Study links after wrong answer */}
              {selectedOption !== currentQuestion.correct && (
                <div className="space-y-2">
                  {!aiExplanation && (
                    <button
                      onClick={handleExplainWhy}
                      disabled={aiExplainLoading}
                      className="w-full flex items-center justify-center gap-2 min-h-[44px] bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[13px] font-medium transition-all active:scale-95 disabled:opacity-60"
                    >
                      {aiExplainLoading ? (
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
                  {aiExplanation && (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2 fade-in">
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">AI Tutor</span>
                      </div>
                      <RichText className="text-[13px] text-zinc-700 leading-relaxed">{aiExplanation}</RichText>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link
                      href={`/flashcards?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(currentQuestion.subtopic)}`}
                      className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-[13px] font-medium hover:bg-indigo-100 active:scale-95 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                      Study {currentQuestion.subtopic}
                    </Link>
                  </div>
                </div>
              )}
              <button
                onClick={handleNext}
                className="w-full min-h-[52px] bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-semibold text-[14px] transition-all duration-150 active:scale-95"
              >
                Next Question
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-8 md:p-12 text-center fade-in">
          <p className="text-zinc-500 text-[15px]">No questions match the selected filters.</p>
          <p className="text-zinc-400 text-[13px] mt-2">Try adjusting your filters above.</p>
        </div>
      )}
    </div>
  );
}
