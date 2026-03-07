"use client";

import { useState, useMemo, useCallback } from "react";
import type { OriginalQuestion } from "@/types/index";
import type { Subject } from "@/types";
import { recordQuestionAttempt } from "@/lib/progress";
import RichText from "@/components/RichText";
import { stripLatex } from "@/lib/strip-latex";

interface QuestionPracticeProps {
  questions: OriginalQuestion[];
  subject: Subject;
}

const difficultyConfig: Record<string, { label: string; pill: string }> = {
  easy: { label: "Easy", pill: "text-green-600 bg-green-50 rounded-lg px-2 py-0.5 text-[11px] font-medium" },
  medium: { label: "Medium", pill: "text-amber-600 bg-amber-50 rounded-lg px-2 py-0.5 text-[11px] font-medium" },
  hard: { label: "Hard", pill: "text-red-600 bg-red-50 rounded-lg px-2 py-0.5 text-[11px] font-medium" },
};

export default function QuestionPractice({ questions, subject }: QuestionPracticeProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [boardFilter, setBoardFilter] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [showMarkScheme, setShowMarkScheme] = useState(false);
  const [checkedCriteria, setCheckedCriteria] = useState<Set<number>>(new Set());

  const boards = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => q.boards.forEach((b) => set.add(b)));
    return Array.from(set).sort();
  }, [questions]);

  const topics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => set.add(q.subtopic));
    return Array.from(set).sort();
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (boardFilter !== "all" && !q.boards.includes(boardFilter)) return false;
      if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) return false;
      if (topicFilter !== "all" && q.subtopic !== topicFilter) return false;
      return true;
    });
  }, [questions, difficultyFilter, topicFilter, boardFilter]);

  const currentQuestion = filteredQuestions[currentIndex] ?? null;

  const handleNextQuestion = useCallback(() => {
    if (filteredQuestions.length <= 1) return;
    let nextIndex: number;
    do { nextIndex = Math.floor(Math.random() * filteredQuestions.length); } while (nextIndex === currentIndex);
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
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  const diagramText = (() => {
    const d = currentQuestion?.diagram;
    if (!d || d === "Null" || d === "null" || !d.trim()) return null;
    return d.trim();
  })();
  const isImageUrl = diagramText && (diagramText.startsWith("http") || diagramText.startsWith("data:"));

  const difficultyLevels = [
    { key: "all", label: "All" },
    { key: "easy", label: "Easy" },
    { key: "medium", label: "Medium" },
    { key: "hard", label: "Hard" },
  ];

  return (
    <div className="space-y-4 md:space-y-5 fade-in">
      {/* Filters */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 md:p-5 space-y-4">
        <div className="flex items-center gap-1.5">
          {difficultyLevels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setDifficultyFilter(key); handleFilterChange(); }}
              className={`px-3.5 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-200 min-h-[44px] sm:min-h-0 ${
                difficultyFilter === key
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <select
            value={boardFilter}
            onChange={(e) => { setBoardFilter(e.target.value); handleFilterChange(); }}
            className="bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 appearance-none cursor-pointer min-h-[44px]"
          >
            <option value="all">All Boards</option>
            {boards.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={topicFilter}
            onChange={(e) => { setTopicFilter(e.target.value); handleFilterChange(); }}
            className="flex-1 bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 appearance-none cursor-pointer min-h-[44px]"
          >
            <option value="all">All Topics</option>
            {topics.map((topic) => <option key={topic} value={topic}>{stripLatex(topic)}</option>)}
          </select>
        </div>

        <p className="text-[11px] text-zinc-400">
          {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Question Card */}
      {currentQuestion ? (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={difficultyConfig[currentQuestion.difficulty]?.pill}>{difficultyConfig[currentQuestion.difficulty]?.label}</span>
            <span className="text-indigo-600 bg-indigo-50 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
              {currentQuestion.marks} mark{currentQuestion.marks !== 1 ? "s" : ""}
            </span>
            <span className="text-[11px] text-zinc-400 ml-auto">{currentQuestion.subtopic}</span>
          </div>

          <RichText className="text-[15px] text-zinc-900 leading-relaxed">{currentQuestion.question_text}</RichText>

          {currentQuestion?.diagram_svg ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-3.5 flex justify-center">
              <div className="w-full overflow-hidden [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[400px]" dangerouslySetInnerHTML={{ __html: currentQuestion.diagram_svg }} />
            </div>
          ) : diagramText && (
            isImageUrl ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={diagramText} alt="Question diagram" className="max-w-full rounded-xl border border-zinc-200" />
              </div>
            ) : (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Diagram</p>
                <RichText className="text-[13px] text-zinc-700 leading-relaxed">{diagramText}</RichText>
              </div>
            )
          )}

          <textarea
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            rows={4}
            placeholder="Write your answer here..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-sm text-zinc-900 placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
          />

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => {
                const newVal = !showMarkScheme;
                setShowMarkScheme(newVal);
                if (newVal && currentQuestion) {
                  recordQuestionAttempt({
                    questionId: currentQuestion.id, subject, subtopic: currentQuestion.subtopic,
                    marks: checkedCriteria.size, totalMarks: currentQuestion.marks, timestamp: Date.now(),
                  });
                }
              }}
              className="border border-zinc-200 bg-white rounded-xl text-[14px] text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 min-h-[52px] w-full transition-all active:scale-95 font-medium"
            >
              {showMarkScheme ? "Hide Mark Scheme" : "Show Mark Scheme"}
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={filteredQuestions.length <= 1}
              className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 text-white rounded-xl text-[14px] font-semibold min-h-[52px] w-full transition-all active:scale-95"
            >
              Next Question
            </button>
          </div>

          {showMarkScheme && (
            <div className="space-y-4 pt-2 fade-in">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Model Answer</p>
                <RichText className="bg-zinc-50 border border-zinc-100 rounded-xl p-3.5 text-[13px] text-zinc-700 leading-relaxed" as="div">
                  {currentQuestion.answer}
                </RichText>
              </div>
              {currentQuestion.marking_criteria.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Marking Criteria</p>
                  <ul className="space-y-1.5">
                    {currentQuestion.marking_criteria.map((criterion, i) => (
                      <li key={i}>
                        <label className="flex items-start gap-3 cursor-pointer group py-1">
                          <input
                            type="checkbox"
                            checked={checkedCriteria.has(i)}
                            onChange={() => toggleCriterion(i)}
                            className="mt-0.5 h-5 w-5 rounded-lg border-zinc-300 bg-white accent-emerald-600 focus:ring-emerald-600/20 cursor-pointer"
                          />
                          <span className={`text-[13px] leading-relaxed transition-all duration-200 ${
                            checkedCriteria.has(i) ? "text-emerald-600 line-through" : "text-zinc-700 group-hover:text-zinc-900"
                          }`}>
                            {criterion}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-zinc-400 pt-1">{checkedCriteria.size} / {currentQuestion.marking_criteria.length} criteria met</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 md:px-6 md:py-12 text-center">
          <p className="text-zinc-500 text-[15px]">No questions match the selected filters.</p>
        </div>
      )}
    </div>
  );
}
