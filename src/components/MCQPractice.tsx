"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { MCQ } from "@/types/index";
import type { Subject } from "@/types";
import { recordMCQAttempt, getAnsweredMCQIds } from "@/lib/progress";
import RichText from "@/components/RichText";
import { stripLatex } from "@/lib/strip-latex";

interface MCQPracticeProps {
  mcqs: MCQ[];
  subject: Subject;
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

export default function MCQPractice({ mcqs, subject }: MCQPracticeProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [boardFilter, setBoardFilter] = useState<string>("all");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);

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

  const currentQuestion: MCQ | null = filteredMcqs.length > 0 ? filteredMcqs[currentIndex % filteredMcqs.length] : null;
  const hasAnswered = selectedOption !== null;
  const answeredBefore = useMemo(() => getAnsweredMCQIds(subject), [subject]);

  const handleOptionClick = useCallback((key: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(key);
    setQuestionsAnswered((prev) => prev + 1);
    const isCorrect = currentQuestion ? key === currentQuestion.correct : false;
    if (isCorrect) setCorrectCount((prev) => prev + 1);
    if (currentQuestion) {
      recordMCQAttempt({
        questionId: currentQuestion.id, subject, subtopic: currentQuestion.subtopic,
        difficulty: currentQuestion.difficulty, correct: isCorrect, selectedAnswer: key,
        correctAnswer: currentQuestion.correct, timestamp: Date.now(),
      });
    }
  }, [selectedOption, currentQuestion, subject]);

  const handleNext = useCallback(() => {
    if (filteredMcqs.length <= 1) { setSelectedOption(null); return; }
    let next = getRandomIndex(filteredMcqs.length);
    while (next === currentIndex % filteredMcqs.length) next = getRandomIndex(filteredMcqs.length);
    setCurrentIndex(next);
    setSelectedOption(null);
  }, [filteredMcqs.length, currentIndex]);

  const handleFilterChange = (setter: (val: string) => void, value: string) => {
    setter(value);
    setSelectedOption(null);
    setCurrentIndex(0);
    setQuestionsAnswered(0);
    setCorrectCount(0);
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

      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-zinc-400 tracking-wide">
          Question {filteredMcqs.length > 0 ? questionsAnswered + 1 : 0} of {filteredMcqs.length}
          {currentQuestion && answeredBefore.has(currentQuestion.id) && (
            <span className="ml-1.5 text-indigo-500" title="You've attempted this before">(seen)</span>
          )}
        </span>
        {questionsAnswered > 0 && (
          <span className="text-[11px] text-zinc-400 tracking-wide">{correctCount}/{questionsAnswered} correct</span>
        )}
      </div>

      {/* Question Card */}
      {currentQuestion ? (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 md:p-5 space-y-4 fade-in">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[11px] px-2 py-0.5 rounded-lg font-medium ${difficultyConfig[currentQuestion.difficulty]?.classes || "bg-zinc-50 text-zinc-400"}`}>
              {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
            </span>
            <span className="bg-zinc-100 text-zinc-500 text-[11px] px-2 py-0.5 rounded-lg">{currentQuestion.subtopic}</span>
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
                  Correct!
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Incorrect
                </div>
              )}
              {remappedExplanation && (
                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3.5">
                  <RichText className="text-[13px] text-zinc-500 leading-relaxed">{remappedExplanation}</RichText>
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
