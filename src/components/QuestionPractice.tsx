"use client";

import { useState, useMemo, useCallback } from "react";
import type { OriginalQuestion } from "@/types/index";
import type { Subject } from "@/types";
import Link from "next/link";
import { recordQuestionAttempt } from "@/lib/progress";
import RichText from "@/components/RichText";
import { stripLatex } from "@/lib/strip-latex";
import ExamTimer, { TimerToggle } from "@/components/ExamTimer";
import { findBestTopicMatch } from "@/lib/topic-normalize";
import { getSubjectBoard, matchesBoard } from "@/lib/banter";
import { getDisplayTopic } from "@/lib/board-topics";

interface GeneratedQuestion {
  id: string;
  question_text: string;
  marks: number;
  answer: string;
  marking_criteria: string[];
  subtopic: string;
  difficulty: string;
  boards: string[];
  diagram: string | null;
  diagram_svg: string | null;
  diagram_type: string | null;
  generated: boolean;
}

interface QuestionPracticeProps {
  questions: OriginalQuestion[];
  subject: Subject;
  initialTopic?: string;
}

const difficultyConfig: Record<string, { label: string; pill: string }> = {
  easy: { label: "Easy", pill: "text-green-600 bg-green-50 rounded-lg px-2 py-0.5 text-[11px] font-medium" },
  medium: { label: "Medium", pill: "text-amber-600 bg-amber-50 rounded-lg px-2 py-0.5 text-[11px] font-medium" },
  hard: { label: "Hard", pill: "text-red-600 bg-red-50 rounded-lg px-2 py-0.5 text-[11px] font-medium" },
};

export default function QuestionPractice({ questions, subject, initialTopic }: QuestionPracticeProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>(() => {
    if (!initialTopic) return "all";
    const allTopics = Array.from(new Set(questions.map((q) => q.subtopic)));
    if (allTopics.includes(initialTopic)) return initialTopic;
    const match = findBestTopicMatch(initialTopic, allTopics);
    return match || "all";
  });
  const [boardFilter, setBoardFilter] = useState<string>(() => getSubjectBoard(subject));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [showMarkScheme, setShowMarkScheme] = useState(false);
  const [checkedCriteria, setCheckedCriteria] = useState<Set<number>>(new Set());
  const [generatedQ, setGeneratedQ] = useState<GeneratedQuestion | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [timerEnabled, setTimerEnabled] = useState(false);

  const boardOptions = useMemo(() => {
    const boardSet = new Set<string>();
    questions.forEach((q) => q.boards.forEach((b) => boardSet.add(b)));
    const boards = Array.from(boardSet).sort();
    const options: { value: string; label: string }[] = [];
    const prefixes = new Map<string, string[]>();
    boards.forEach((b) => {
      const dash = b.indexOf("-");
      const prefix = dash > 0 ? b.substring(0, dash) : b;
      if (!prefixes.has(prefix)) prefixes.set(prefix, []);
      prefixes.get(prefix)!.push(b);
    });
    prefixes.forEach((variants, prefix) => {
      if (variants.length > 1) {
        options.push({ value: prefix, label: `All ${prefix}` });
        variants.forEach((v) => options.push({ value: v, label: `  ${v}` }));
      } else {
        options.push({ value: variants[0], label: variants[0] });
      }
    });
    return options;
  }, [questions]);

  const topics = useMemo(() => {
    const set = new Set<string>();
    questions.filter((q) => matchesBoard(q.boards, boardFilter)).forEach((q) => set.add(getDisplayTopic(q.board_topics, q.boards, boardFilter, q.subtopic)));
    return Array.from(set).sort();
  }, [questions, boardFilter]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (!matchesBoard(q.boards, boardFilter)) return false;
      if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) return false;
      if (topicFilter !== "all" && getDisplayTopic(q.board_topics, q.boards, boardFilter, q.subtopic) !== topicFilter) return false;
      return true;
    });
  }, [questions, difficultyFilter, topicFilter, boardFilter]);

  const currentQuestion = filteredQuestions[currentIndex] ?? null;

  // 1.5 minutes per mark for written questions
  const activeQ = generatedQ || currentQuestion;
  const timerDuration = activeQ ? activeQ.marks * 90 : 90;
  const timerResetKey = activeQ?.id || generatedQ?.id || `${currentIndex}`;

  const handleTimeUp = useCallback(() => {
    setShowMarkScheme(true);
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (generatedQ) {
      setGeneratedQ(null);
      setStudentAnswer("");
      setShowMarkScheme(false);
      setCheckedCriteria(new Set());
      return;
    }
    if (filteredQuestions.length <= 1) return;
    let nextIndex: number;
    do { nextIndex = Math.floor(Math.random() * filteredQuestions.length); } while (nextIndex === currentIndex);
    setCurrentIndex(nextIndex);
    setStudentAnswer("");
    setShowMarkScheme(false);
    setCheckedCriteria(new Set());
  }, [filteredQuestions.length, currentIndex, generatedQ]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic: topicFilter !== "all" ? topicFilter : undefined,
          board: boardFilter !== "all" ? boardFilter : undefined,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedQ(data as GeneratedQuestion);
      setStudentAnswer("");
      setShowMarkScheme(false);
      setCheckedCriteria(new Set());
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setGenerating(false);
    }
  }, [subject, topicFilter, boardFilter]);

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
            onChange={(e) => { setBoardFilter(e.target.value); setTopicFilter("all"); handleFilterChange(); }}
            className="bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 shrink-0 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 appearance-none cursor-pointer min-h-[44px]"
          >
            <option value="all">All Boards</option>
            {boardOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-zinc-400">
            {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""} available
          </p>
          <TimerToggle enabled={timerEnabled} onToggle={setTimerEnabled} />
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-[12px] font-semibold transition-all active:scale-95 min-h-[36px]"
          >
            {generating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                Generate Hard Question
              </>
            )}
          </button>
        </div>
        {genError && (
          <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{genError}</p>
        )}
      </div>

      {/* Exam Timer */}
      {(generatedQ || currentQuestion) && (
        <ExamTimer
          duration={timerDuration}
          onTimeUp={handleTimeUp}
          resetKey={timerResetKey}
          enabled={timerEnabled}
        />
      )}

      {/* Generated Question Card */}
      {generatedQ && (
        <div className="bg-white border-2 border-blue-200 shadow-sm rounded-2xl p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-blue-700 bg-blue-50 rounded-lg px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              AI Generated
            </span>
            <span className={difficultyConfig.hard.pill}>Hard</span>
            <span className="text-blue-600 bg-blue-50 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
              {generatedQ.marks} mark{generatedQ.marks !== 1 ? "s" : ""}
            </span>
            <span className="text-[11px] text-zinc-400 ml-auto">{generatedQ.subtopic}</span>
          </div>

          <RichText className="text-[15px] text-zinc-900 leading-relaxed">{generatedQ.question_text}</RichText>

          <textarea
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            rows={4}
            placeholder="Write your answer here, Yabi..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-sm text-zinc-900 placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
          />

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => setShowMarkScheme(!showMarkScheme)}
              className="border border-zinc-200 bg-white rounded-xl text-[14px] text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 min-h-[52px] w-full transition-all active:scale-95 font-medium"
            >
              {showMarkScheme ? "Hide Mark Scheme" : "Show Mark Scheme"}
            </button>
            <div className="flex gap-2.5">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-[14px] font-semibold min-h-[52px] transition-all active:scale-95"
              >
                {generating ? "Generating..." : "Another Hard One"}
              </button>
              <button
                onClick={handleNextQuestion}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[14px] font-semibold min-h-[52px] transition-all active:scale-95"
              >
                Back to Bank
              </button>
            </div>
          </div>

          {showMarkScheme && (
            <div className="space-y-4 pt-2 fade-in">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Model Answer</p>
                <RichText className="bg-zinc-50 border border-zinc-100 rounded-xl p-3.5 text-[13px] text-zinc-700 leading-relaxed" as="div">
                  {generatedQ.answer}
                </RichText>
              </div>
              {generatedQ.marking_criteria.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Marking Criteria</p>
                  <ul className="space-y-1.5">
                    {generatedQ.marking_criteria.map((criterion, i) => (
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
                  <p className="text-[11px] text-zinc-400 pt-1">{checkedCriteria.size} / {generatedQ.marking_criteria.length} criteria met</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Question Card */}
      {!generatedQ && currentQuestion ? (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={difficultyConfig[currentQuestion.difficulty]?.pill}>{difficultyConfig[currentQuestion.difficulty]?.label}</span>
            <span className="text-blue-600 bg-blue-50 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
              {currentQuestion.marks} mark{currentQuestion.marks !== 1 ? "s" : ""}
            </span>
            <span className="text-[11px] text-zinc-400 ml-auto">{getDisplayTopic(currentQuestion.board_topics, currentQuestion.boards, boardFilter, currentQuestion.subtopic)}</span>
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
            placeholder="Write your answer here, Yabi..."
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

              {/* Related study links */}
              <div className="flex gap-2 pt-2">
                <Link
                  href={`/flashcards?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(getDisplayTopic(currentQuestion.board_topics, currentQuestion.boards, boardFilter, currentQuestion.subtopic))}`}
                  className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-[13px] font-medium hover:bg-blue-100 active:scale-95 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                  Revise {getDisplayTopic(currentQuestion.board_topics, currentQuestion.boards, boardFilter, currentQuestion.subtopic)}
                </Link>
                <Link
                  href={`/mcqs?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(getDisplayTopic(currentQuestion.board_topics, currentQuestion.boards, boardFilter, currentQuestion.subtopic))}`}
                  className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl text-[13px] font-medium hover:bg-zinc-100 active:scale-95 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
                  MCQs on this topic
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : !generatedQ && (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 md:px-6 md:py-12 text-center">
          <p className="text-zinc-500 text-[15px]">No questions match the selected filters.</p>
        </div>
      )}
    </div>
  );
}
