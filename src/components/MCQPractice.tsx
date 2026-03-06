"use client";

import { useState, useMemo, useCallback } from "react";
import type { MCQ } from "@/types/index";

interface MCQPracticeProps {
  mcqs: MCQ[];
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/20 text-green-400 border-green-500/50",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  hard: "bg-red-500/20 text-red-400 border-red-500/50",
};

const optionLabels = ["A", "B", "C", "D"];

function getRandomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

export default function MCQPractice({ mcqs }: MCQPracticeProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);

  // Filtered MCQs
  const filteredMcqs = useMemo(() => {
    let filtered = mcqs;
    if (difficultyFilter !== "all") {
      filtered = filtered.filter((m) => m.difficulty === difficultyFilter);
    }
    if (topicFilter !== "all") {
      filtered = filtered.filter((m) => m.subtopic === topicFilter);
    }
    return filtered;
  }, [mcqs, difficultyFilter, topicFilter]);

  // Derive unique topics from the currently difficulty-filtered set
  const topics = useMemo(() => {
    let base = mcqs;
    if (difficultyFilter !== "all") {
      base = base.filter((m) => m.difficulty === difficultyFilter);
    }
    const set = new Set(base.map((m) => m.subtopic));
    return Array.from(set).sort();
  }, [mcqs, difficultyFilter]);

  // Current question
  const currentQuestion: MCQ | null =
    filteredMcqs.length > 0
      ? filteredMcqs[currentIndex % filteredMcqs.length]
      : null;

  const hasAnswered = selectedOption !== null;

  const handleOptionClick = (key: string) => {
    if (hasAnswered) return;
    setSelectedOption(key);
    setQuestionsAnswered((prev) => prev + 1);
  };

  const handleNext = useCallback(() => {
    if (filteredMcqs.length <= 1) {
      setSelectedOption(null);
      return;
    }
    let next = getRandomIndex(filteredMcqs.length);
    // Avoid repeating the same question
    while (next === currentIndex % filteredMcqs.length) {
      next = getRandomIndex(filteredMcqs.length);
    }
    setCurrentIndex(next);
    setSelectedOption(null);
  }, [filteredMcqs.length, currentIndex]);

  const handleFilterChange = (
    setter: (val: string) => void,
    value: string
  ) => {
    setter(value);
    setSelectedOption(null);
    setCurrentIndex(0);
    setQuestionsAnswered(0);
  };

  const optionEntries = currentQuestion
    ? Object.entries(currentQuestion.options)
    : [];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 md:space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <select
          value={difficultyFilter}
          onChange={(e) =>
            handleFilterChange(setDifficultyFilter, e.target.value)
          }
          className="w-full md:w-auto bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          value={topicFilter}
          onChange={(e) => handleFilterChange(setTopicFilter, e.target.value)}
          className="w-full md:w-auto bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Topics</option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          Question {filteredMcqs.length > 0 ? questionsAnswered + 1 : 0} of{" "}
          {filteredMcqs.length}
        </span>
        {questionsAnswered > 0 && (
          <span>{questionsAnswered} answered this session</span>
        )}
      </div>

      {/* Question Card */}
      {currentQuestion ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Header badges */}
          <div className="flex flex-wrap gap-2 items-center">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                difficultyColors[currentQuestion.difficulty]
              }`}
            >
              {currentQuestion.difficulty.charAt(0).toUpperCase() +
                currentQuestion.difficulty.slice(1)}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-blue-500/20 text-blue-400 border-blue-500/50">
              {currentQuestion.subject}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-gray-700/50 text-gray-300 border-gray-600">
              {currentQuestion.subtopic}
            </span>
          </div>

          {/* Question text */}
          <p className="text-base md:text-lg text-gray-100 leading-relaxed">
            {currentQuestion.question}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {optionEntries.map(([key, value], idx) => {
              const isSelected = selectedOption === key;
              const isCorrect = key === currentQuestion.correct;
              const showCorrect = hasAnswered && isCorrect;
              const showWrong = hasAnswered && isSelected && !isCorrect;

              let borderClass = "border-gray-700 hover:border-gray-500";
              let bgClass = "bg-gray-800/50 hover:bg-gray-800";

              if (showCorrect) {
                borderClass = "border-green-500";
                bgClass = "bg-green-500/10";
              } else if (showWrong) {
                borderClass = "border-red-500";
                bgClass = "bg-red-500/10";
              } else if (hasAnswered) {
                borderClass = "border-gray-700";
                bgClass = "bg-gray-800/30";
              }

              return (
                <button
                  key={key}
                  onClick={() => handleOptionClick(key)}
                  disabled={hasAnswered}
                  className={`w-full text-left flex items-start gap-3 p-4 min-h-[48px] rounded-xl border transition-all duration-200 active:scale-[0.98] ${borderClass} ${bgClass} ${
                    hasAnswered ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold ${
                      showCorrect
                        ? "bg-green-500 text-white"
                        : showWrong
                        ? "bg-red-500 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {optionLabels[idx] || key}
                  </span>
                  <span
                    className={`pt-1 ${
                      showCorrect
                        ? "text-green-400"
                        : showWrong
                        ? "text-red-400"
                        : "text-gray-200"
                    }`}
                  >
                    {value}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {hasAnswered && (
            <div className="space-y-4">
              {selectedOption === currentQuestion.correct ? (
                <div className="flex items-center gap-2 text-green-400 font-semibold text-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Correct!
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-400 font-semibold text-lg">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Incorrect
                  </div>
                  <p className="text-sm text-gray-400">
                    The correct answer is{" "}
                    <span className="text-green-400 font-semibold">
                      {currentQuestion.correct}:{" "}
                      {currentQuestion.options[currentQuestion.correct]}
                    </span>
                  </p>
                </div>
              )}

              {/* Explanation - shown for both correct and incorrect answers */}
              {currentQuestion.explanation && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-300 mb-1">
                    Explanation
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Next button */}
              <button
                onClick={handleNext}
                className="w-full min-h-[48px] py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-medium rounded-xl transition-all duration-200"
              >
                Next Question
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-12 text-center">
          <p className="text-gray-400 text-lg">
            No questions match the selected filters.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Try adjusting your filters above.
          </p>
        </div>
      )}
    </div>
  );
}
