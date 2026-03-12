"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getTotalStats, getWeakTopics, getRepeatedMistakes,
  getCameraMistakePatterns, getWeeklyReport, getActivityHistory,
  getTopicAccuracies,
  type DailyStats, type WeakTopic,
} from "@/lib/progress";
import { getUnmasteredPrerequisites } from "@/lib/topic-dependencies";
import { getProgressGreeting } from "@/lib/banter";
import type { Subject } from "@/types";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-3.5 shadow-sm">
      <p className="text-2xl font-bold text-zinc-900">{value}</p>
      <p className="text-[11px] text-zinc-500 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ActivityBar({ days }: { days: DailyStats[] }) {
  const maxActivity = Math.max(1, ...days.map((d) => d.mcqsAnswered + d.flashcardsReviewed + d.questionsAttempted + d.cameraMarks));
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
      <h3 className="text-[13px] font-semibold text-zinc-900 mb-3">Last 7 Days</h3>
      <div className="flex items-end gap-1.5 h-24">
        {days.map((d, i) => {
          const total = d.mcqsAnswered + d.flashcardsReviewed + d.questionsAttempted + d.cameraMarks;
          const height = total > 0 ? Math.max(8, (total / maxActivity) * 100) : 4;
          const date = new Date(d.date || new Date());
          const dayIdx = date.getDay();
          const label = dayLabels[dayIdx === 0 ? 6 : dayIdx - 1] || "";
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full rounded-md transition-all ${total > 0 ? "bg-blue-500" : "bg-zinc-100"}`} style={{ height: `${height}%` }} title={`${total} activities`} />
              <span className="text-[9px] text-zinc-400">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeakTopicsList({ topics, subjectAccuracies }: { topics: WeakTopic[]; subjectAccuracies: Record<string, Map<string, number>> }) {
  if (topics.length === 0) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
      <h3 className="text-[13px] font-semibold text-zinc-900 mb-2">Weak Topics</h3>
      <p className="text-[11px] text-zinc-400 mb-3">Tap a topic to practise it</p>
      <div className="space-y-3">
        {topics.slice(0, 8).map((t, i) => {
          const prereqs = subjectAccuracies[t.subject]
            ? getUnmasteredPrerequisites(t.subject as Subject, t.topic, subjectAccuracies[t.subject], 70)
            : [];
          return (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-zinc-700 font-medium truncate">{t.topic}</span>
                    <span className={`text-[11px] font-medium ${t.accuracy < 50 ? "text-red-600" : t.accuracy < 70 ? "text-amber-600" : "text-emerald-600"}`}>{t.accuracy}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${t.accuracy < 50 ? "bg-red-500" : t.accuracy < 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${t.accuracy}%` }} />
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 shrink-0">{t.totalAttempts} Qs</span>
              </div>
              {prereqs.length > 0 && (
                <div className="bg-amber-50/60 border border-amber-200/60 rounded-lg px-3 py-2 space-y-1.5">
                  <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Master these first</p>
                  {prereqs.slice(0, 3).map((p, j) => (
                    <Link
                      key={j}
                      href={`/mcqs?subject=${encodeURIComponent(t.subject)}&topic=${encodeURIComponent(p.topic)}`}
                      className="flex items-center justify-between group"
                    >
                      <span className="text-[11px] text-amber-800 group-hover:text-amber-950 transition-colors">{p.topic}</span>
                      <span className="text-[10px] text-amber-600">{p.reason}</span>
                    </Link>
                  ))}
                </div>
              )}
              <div className="flex gap-1.5">
                <Link
                  href={`/mcqs?subject=${encodeURIComponent(t.subject)}&topic=${encodeURIComponent(t.topic)}&mode=weak`}
                  className="flex-1 text-center py-1.5 text-[11px] font-medium text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors"
                >
                  MCQs
                </Link>
                <Link
                  href={`/flashcards?subject=${encodeURIComponent(t.subject)}&topic=${encodeURIComponent(t.topic)}`}
                  className="flex-1 text-center py-1.5 text-[11px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                >
                  Flashcards
                </Link>
                <Link
                  href={`/questions?subject=${encodeURIComponent(t.subject)}&topic=${encodeURIComponent(t.topic)}`}
                  className="flex-1 text-center py-1.5 text-[11px] font-medium text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors"
                >
                  Questions
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"overview" | "weekly">("overview");

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="space-y-4 fade-in pt-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Yabi&apos;s Progress</h1>
        <div className="text-zinc-400 text-sm">Loading...</div>
      </div>
    );
  }

  const stats = getTotalStats();
  const weakTopics = getWeakTopics();
  const repeatedMistakes = getRepeatedMistakes();
  const cameraPatterns = getCameraMistakePatterns();
  const weeklyReport = getWeeklyReport();
  const activity = getActivityHistory();
  const totalActivity = stats.totalMCQs + stats.totalFlashcards + stats.totalQuestions + stats.totalCameraMarks;

  // Build per-subject accuracy maps for prerequisite lookups
  const subjectAccuracies: Record<string, Map<string, number>> = {};
  for (const s of ["Maths", "Biology", "Chemistry"]) {
    subjectAccuracies[s] = getTopicAccuracies(s as Subject);
  }

  return (
    <div className="space-y-4 fade-in pt-2">
      <div>
        <div className="inline-block px-3 py-1 bg-zinc-200/50 text-zinc-600 rounded-md text-xs font-semibold tracking-wide uppercase mb-2">Dashboard</div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Yabi&apos;s Progress</h1>
        <p className="text-zinc-500 text-sm mt-0.5">{getProgressGreeting(stats.accuracy)}</p>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 bg-zinc-100 rounded-xl p-0.5">
        {(["overview", "weekly"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all ${tab === t ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
          >
            {t === "overview" ? "Overview" : "Weekly Report"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-4 fade-in">
          {totalActivity === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center shadow-sm">
              <p className="text-zinc-500 text-[15px]">No activity yet</p>
              <p className="text-zinc-400 text-[13px] mt-1">You haven&apos;t done anything yet Yabi... get to work</p>
              <Link href="/mcqs" className="inline-block mt-4 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors">Start MCQs</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <StatCard label="MCQs Answered" value={stats.totalMCQs} sub={`${stats.accuracy}% accuracy`} />
                <StatCard label="Flashcards Reviewed" value={stats.totalFlashcards} />
                <StatCard label="Questions Practised" value={stats.totalQuestions} />
                <StatCard label="Camera Marks" value={stats.totalCameraMarks} />
              </div>
              <ActivityBar days={activity} />
              <WeakTopicsList topics={weakTopics} subjectAccuracies={subjectAccuracies} />

              {/* Quick action: practise all weak areas */}
              {weakTopics.length > 0 && weakTopics[0].accuracy < 70 && (
                <Link
                  href={`/mcqs?subject=${encodeURIComponent(weakTopics[0].subject)}&topic=${encodeURIComponent(weakTopics[0].topic)}&mode=weak`}
                  className="flex items-center justify-center gap-2 w-full min-h-[48px] bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-semibold text-[13px] transition-all duration-150 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                  Practise your weakest topic: {weakTopics[0].topic} ({weakTopics[0].accuracy}%)
                </Link>
              )}

              {repeatedMistakes.length > 0 && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[13px] font-semibold text-zinc-900 mb-2">Repeated Mistakes</h3>
                  <p className="text-[12px] text-zinc-500 mb-3">{repeatedMistakes.length} question{repeatedMistakes.length !== 1 ? "s" : ""} you keep getting wrong</p>
                  <div className="space-y-2">
                    {repeatedMistakes.slice(0, 5).map((m, i) => (
                      <Link key={i} href={`/mcqs?subject=${encodeURIComponent(m.subject)}&topic=${encodeURIComponent(m.subtopic)}&mode=weak`} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2 hover:bg-red-100 transition-colors group">
                        <div className="min-w-0"><span className="text-[12px] text-red-700 font-medium">{m.subject}</span><span className="text-[11px] text-red-500 ml-2">{m.subtopic}</span></div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] text-red-600 font-semibold">{m.wrongCount}x wrong</span>
                          <svg className="w-3.5 h-3.5 text-red-300 group-hover:text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {cameraPatterns.length > 0 && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[13px] font-semibold text-zinc-900 mb-2">Camera Mark Patterns</h3>
                  <p className="text-[12px] text-zinc-500 mb-3">Recurring feedback from AI marking</p>
                  <div className="space-y-1.5">
                    {cameraPatterns.slice(0, 5).map((p, i) => (
                      <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <span className="text-[12px] text-amber-700 flex-1">{p.pattern}</span>
                        <span className="text-[11px] text-amber-600 font-semibold shrink-0">{p.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "weekly" && (
        <div className="space-y-4 fade-in">
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-[13px] font-semibold text-zinc-900 mb-3">This Week vs Last Week</h3>
            <div className="space-y-3">
              <ComparisonRow label="MCQs Answered" thisWeek={weeklyReport.thisWeek.mcqsAnswered} lastWeek={weeklyReport.lastWeek.mcqsAnswered} />
              <ComparisonRow label="MCQ Accuracy" thisWeek={weeklyReport.thisWeek.mcqsAnswered > 0 ? Math.round((weeklyReport.thisWeek.mcqsCorrect / weeklyReport.thisWeek.mcqsAnswered) * 100) : 0} lastWeek={weeklyReport.lastWeek.mcqsAnswered > 0 ? Math.round((weeklyReport.lastWeek.mcqsCorrect / weeklyReport.lastWeek.mcqsAnswered) * 100) : 0} suffix="%" />
              <ComparisonRow label="Flashcards Reviewed" thisWeek={weeklyReport.thisWeek.flashcardsReviewed} lastWeek={weeklyReport.lastWeek.flashcardsReviewed} />
              <ComparisonRow label="Questions Practised" thisWeek={weeklyReport.thisWeek.questionsAttempted} lastWeek={weeklyReport.lastWeek.questionsAttempted} />
              <ComparisonRow label="Camera Marks" thisWeek={weeklyReport.thisWeek.cameraMarks} lastWeek={weeklyReport.lastWeek.cameraMarks} />
            </div>
          </div>

          {weeklyReport.weakTopics.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
              <h3 className="text-[13px] font-semibold text-zinc-900 mb-2">Focus Areas</h3>
              <p className="text-[12px] text-zinc-500 mb-3">Topics that need the most work</p>
              <div className="space-y-1.5">
                {weeklyReport.weakTopics.map((t, i) => (
                  <Link key={i} href={`/mcqs?subject=${encodeURIComponent(t.subject)}&topic=${encodeURIComponent(t.topic)}&mode=weak`} className="flex items-center justify-between bg-zinc-50 rounded-lg px-3 py-2 hover:bg-zinc-100 transition-colors group">
                    <span className="text-[12px] text-zinc-700 group-hover:text-zinc-900">{t.topic}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold ${t.accuracy < 50 ? "text-red-600" : "text-amber-600"}`}>{t.accuracy}%</span>
                      <svg className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {weeklyReport.repeatedMistakes > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-red-800">{weeklyReport.repeatedMistakes} repeated mistake{weeklyReport.repeatedMistakes !== 1 ? "s" : ""}</p>
                  <p className="text-[11px] text-red-600">Questions you keep getting wrong - review them!</p>
                </div>
              </div>
            </div>
          )}

          {weeklyReport.cameraPatterns.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
              <h3 className="text-[13px] font-semibold text-zinc-900 mb-2">Recurring Feedback</h3>
              <p className="text-[12px] text-zinc-500 mb-3">Patterns from your camera-marked work</p>
              <div className="space-y-1.5">
                {weeklyReport.cameraPatterns.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <span className="text-[12px] text-amber-700 flex-1">{p.pattern}</span>
                    <span className="text-[11px] text-amber-600 font-semibold shrink-0">{p.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ComparisonRow({ label, thisWeek, lastWeek, suffix = "" }: { label: string; thisWeek: number; lastWeek: number; suffix?: string }) {
  const diff = thisWeek - lastWeek;
  const isUp = diff > 0;
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-zinc-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-zinc-900">{thisWeek}{suffix}</span>
        {diff !== 0 && <span className={`text-[10px] font-medium ${isUp ? "text-emerald-600" : "text-red-600"}`}>{isUp ? "+" : ""}{diff}{suffix}</span>}
        <span className="text-[10px] text-zinc-400">(was {lastWeek}{suffix})</span>
      </div>
    </div>
  );
}
