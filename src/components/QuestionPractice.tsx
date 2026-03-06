"use client";

import { useState, useMemo, useCallback } from "react";
import type { OriginalQuestion } from "@/types/index";

interface QuestionPracticeProps {
  questions: OriginalQuestion[];
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-600 text-green-100",
  medium: "bg-yellow-600 text-yellow-100",
  hard: "bg-red-600 text-red-100",
};

export default function QuestionPractice({ questions }: QuestionPracticeProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [showMarkScheme, setShowMarkScheme] = useState(false);
  const [checkedCriteria, setCheckedCriteria] = useState<Set<number>>(new Set());

  const topics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => set.add(q.subtopic));
    return Array.from(set).sort();
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) return false;
      if (topicFilter !== "all" && q.subtopic !== topicFilter) return false;
      return true;
    });
  }, [questions, difficultyFilter, topicFilter]);

  const currentQuestion = filteredQuestions[currentIndex] ?? null;

  const handleNextQuestion = useCallback(() => {
    if (filteredQuestions.length <= 1) return;
    let nextIndex: number;
    do {
      nextIndex = Math.floor(Math.random() * filteredQuestions.length);
    } while (nextIndex === currentIndex);
    setCurrentIndex(nextIndex);
    setStudentAnswer("");
    setShowMarkScheme(false);
    setCheckedCriteria(new Set());
  }, [filteredQuestions.length, currentIndex]);

  const handleFilterChange = useCallback(() => {
    setCurrentIndex(0);
    setStudentAnswer("");
    setShowMarkScheme(false);
    setCheckedCriteria(new Set());
  }, []);

  const toggleCriterion = (index: number) => {
    setCheckedCriteria((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const hasDiagram =
    currentQuestion?.diagram &&
    currentQuestion.diagram !== "Null" &&
    currentQuestion.diagram !== "null" &&
    currentQuestion.diagram.trim() !== "";

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filter Controls — stacked on mobile, row on md+ */}
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4">
        {/* Difficulty buttons */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300">Difficulty:</label>
          <div className="flex gap-1">
            {["all", "easy", "medium", "hard"].map((level) => (
              <button
                key={level}
                onClick={() => {
                  setDifficultyFilter(level);
                  handleFilterChange();
                }}
                className={`min-h-[48px] px-4 py-2 text-sm rounded-md font-medium transition-colors active:scale-[0.98] ${
                  difficultyFilter === level
                    ? level === "all"
                      ? "bg-blue-600 text-white"
                      : difficultyColors[level]
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Topic select — full-width on mobile */}
        <div className="w-full md:w-auto space-y-1.5">
          <label className="text-sm font-medium text-gray-300">Topic:</label>
          <select
            value={topicFilter}
            onChange={(e) => {
              setTopicFilter(e.target.value);
              handleFilterChange();
            }}
            className="w-full md:w-auto min-h-[48px] bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Topics</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <span className="text-sm text-gray-500 md:ml-auto">
          {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""} available
        </span>
      </div>

      {/* Question Card */}
      {currentQuestion ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {/* Question Header */}
          <div className="p-4 md:px-6 md:py-4 border-b border-gray-800 flex flex-wrap items-center gap-2 md:gap-3">
            <span className="bg-purple-600/20 text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-full">
              {currentQuestion.subject}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                difficultyColors[currentQuestion.difficulty]
              }`}
            >
              {currentQuestion.difficulty.charAt(0).toUpperCase() +
                currentQuestion.difficulty.slice(1)}
            </span>
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              [{currentQuestion.marks} mark{currentQuestion.marks !== 1 ? "s" : ""}]
            </span>
            <div className="basis-full md:basis-auto md:ml-auto text-xs text-gray-500 mt-1 md:mt-0">
              {currentQuestion.subtopic}
            </div>
          </div>

          {/* Question Body */}
          <div className="p-4 md:px-6 md:py-5">
            <p className="text-gray-100 text-base leading-relaxed whitespace-pre-wrap">
              {currentQuestion.question_text}
            </p>

            {hasDiagram && (
              <div className="mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentQuestion.diagram!}
                  alt="Question diagram"
                  className="max-w-full rounded-lg border border-gray-700"
                />
              </div>
            )}
          </div>

          {/* Student Answer Area */}
          <div className="px-4 pb-4 md:px-6 md:pb-5">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Your Answer
            </label>
            <textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              rows={4}
              placeholder="Write your answer here..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y md:rows-6"
            />
          </div>

          {/* Action Buttons — stacked full-width on mobile, side-by-side on md+ */}
          <div className="px-4 pb-4 md:px-6 md:pb-5 flex flex-col gap-3 md:flex-row md:gap-3">
            <button
              onClick={() => setShowMarkScheme((prev) => !prev)}
              className="w-full md:w-auto min-h-[48px] px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors active:scale-[0.98]"
            >
              {showMarkScheme ? "Hide Mark Scheme" : "Show Mark Scheme"}
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={filteredQuestions.length <= 1}
              className="w-full md:w-auto min-h-[48px] px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors active:scale-[0.98]"
            >
              Next Question
            </button>
          </div>

          {/* Mark Scheme */}
          {showMarkScheme && (
            <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-4 border-t border-gray-800 pt-4 md:pt-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">
                  Model Answer
                </h3>
                <div className="bg-gray-800 rounded-lg px-4 py-3 text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {currentQuestion.answer}
                </div>
              </div>

              {currentQuestion.marking_criteria.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">
                    Marking Criteria
                  </h3>
                  <ul className="space-y-2">
                    {currentQuestion.marking_criteria.map((criterion, i) => (
                      <li key={i}>
                        <label className="flex items-start gap-3 cursor-pointer group min-h-[48px] py-1">
                          <input
                            type="checkbox"
                            checked={checkedCriteria.has(i)}
                            onChange={() => toggleCriterion(i)}
                            className="mt-0.5 h-5 w-5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                          />
                          <span
                            className={`text-sm transition-colors ${
                              checkedCriteria.has(i)
                                ? "text-green-400 line-through"
                                : "text-gray-300 group-hover:text-gray-100"
                            }`}
                          >
                            {criterion}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-gray-500">
                    {checkedCriteria.size} / {currentQuestion.marking_criteria.length} criteria met
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:px-6 md:py-12 text-center">
          <p className="text-gray-400 text-base">
            No questions match the selected filters.
          </p>
        </div>
      )}
    </div>
  );
}
