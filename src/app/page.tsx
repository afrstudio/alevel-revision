"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ExamCountdown from "@/components/ExamCountdown";
import { getStudyTip } from "@/lib/banter";
import { getRecommendations, getDueCardCount, getNextReviewTime } from "@/lib/progress";

const counts = {
  Maths: { mcqs: 462, questions: 279, flashcards: 1718 },
  Biology: { mcqs: 484, questions: 342, flashcards: 4377 },
  Chemistry: { mcqs: 408, questions: 251, flashcards: 2763 },
} as const;

const subjectConfig = [
  { name: "Maths", board: "Edexcel 9MA0", color: "bg-indigo-500", lightBg: "bg-indigo-50", borderColor: "border-l-indigo-500" },
  { name: "Biology", board: "Edexcel 9BN0", color: "bg-emerald-500", lightBg: "bg-emerald-50", borderColor: "border-l-emerald-500" },
  { name: "Chemistry", board: "OCR H432", color: "bg-teal-500", lightBg: "bg-teal-50", borderColor: "border-l-teal-500" },
] as const;

const modes = [
  { name: "MCQs", href: "/mcqs", desc: "1,354 questions", iconD: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-indigo-500", hoverBg: "hover:bg-indigo-50/50" },
  { name: "Questions", href: "/questions", desc: "872 with mark schemes", iconD: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z", color: "bg-violet-500", hoverBg: "hover:bg-violet-50/50" },
  { name: "Flashcards", href: "/flashcards", desc: "8,858 cards", iconD: "M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0L12 16.5l-5.571-2.25m11.142 0L21.75 16.5 12 21.75 2.25 16.5l4.179-2.25", color: "bg-emerald-500", hoverBg: "hover:bg-emerald-50/50" },
  { name: "Past Papers", href: "/papers", desc: "12,424 real questions", iconD: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z", color: "bg-teal-500", hoverBg: "hover:bg-teal-50/50" },
  { name: "Practice Papers", href: "/practice-papers", desc: "30 exam-style packs", iconD: "M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776", color: "bg-amber-500", hoverBg: "hover:bg-amber-50/50" },
  { name: "AI Camera", href: "/camera", desc: "Scan & mark answers", iconD: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z", color: "bg-zinc-900", hoverBg: "hover:bg-zinc-50" },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatTimeUntil(timestamp: number): string {
  const diff = timestamp - Date.now();
  if (diff <= 0) return "now";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "in less than an hour";
  if (hours < 24) return `in ${hours} hour${hours !== 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  return `in ${days} day${days !== 1 ? "s" : ""}`;
}

export default function Home() {
  const [greeting, setGreeting] = useState("Hi");
  const [tip, setTip] = useState("");
  const [recommendations, setRecommendations] = useState<ReturnType<typeof getRecommendations>>([]);
  const [dueCards, setDueCards] = useState(0);
  const [nextReview, setNextReview] = useState<number | null>(null);

  useEffect(() => {
    setGreeting(getGreeting());
    setTip(getStudyTip());
    setRecommendations(getRecommendations());
    setDueCards(getDueCardCount());
    setNextReview(getNextReviewTime());
  }, []);

  const totalItems = Object.values(counts).reduce(
    (sum, c) => sum + c.mcqs + c.questions + c.flashcards,
    0
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome */}
      <section className="pt-4 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
          {greeting}, Yabi
        </h1>
        <p className="text-sm text-zinc-400">
          {formatNumber(totalItems)} practice items across 3 subjects
        </p>
      </section>

      {/* Exam Countdown */}
      <ExamCountdown />

      {/* Spaced Repetition Due Cards */}
      {dueCards > 0 && (
        <Link href="/flashcards" className="block group">
          <div className="bg-zinc-900 rounded-2xl p-4 flex items-center justify-between hover:bg-zinc-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white">{dueCards} flashcard{dueCards !== 1 ? "s" : ""} due for review</p>
                <p className="text-[12px] text-zinc-400">Keep your memory fresh — review now</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </div>
        </Link>
      )}
      {dueCards === 0 && nextReview && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-emerald-900">All caught up</p>
            <p className="text-[12px] text-emerald-600">Next review {formatTimeUntil(nextReview)}</p>
          </div>
        </div>
      )}

      {/* Recommended for you */}
      {recommendations.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest px-0.5">Recommended for you</h2>
          <div className="space-y-2">
            {recommendations.map((rec, i) => {
              const href = rec.mode === "mcqs"
                ? `/mcqs?subject=${encodeURIComponent(rec.subject)}&topic=${encodeURIComponent(rec.topic)}`
                : `/flashcards?subject=${encodeURIComponent(rec.subject)}&topic=${encodeURIComponent(rec.topic)}`;
              const accentColor = rec.accuracy < 40 ? "border-l-red-500" : rec.accuracy < 60 ? "border-l-amber-500" : "border-l-yellow-400";
              return (
                <Link key={i} href={href} className="block group">
                  <div className={`bg-white border border-zinc-200/80 rounded-xl p-3.5 border-l-[3px] ${accentColor} hover:bg-zinc-50/50 transition-colors`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-zinc-900 truncate">{rec.topic}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{rec.subject} {rec.mode === "mcqs" ? "MCQs" : "Flashcards"} &middot; {rec.reason}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${rec.accuracy < 40 ? "bg-red-500" : rec.accuracy < 60 ? "bg-amber-500" : "bg-yellow-400"}`}
                            style={{ width: `${rec.accuracy}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-zinc-500 tabular-nums w-8 text-right">{rec.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest px-0.5">Get started</h2>
          <div className="bg-white border border-zinc-200/80 rounded-xl p-4 space-y-3">
            <p className="text-[13px] text-zinc-600">Start practising to get personalised recommendations based on your weak areas.</p>
            <div className="flex gap-2">
              <Link href="/mcqs" className="flex-1 text-center py-2.5 bg-zinc-900 text-white text-[13px] font-medium rounded-xl hover:bg-zinc-800 active:scale-95 transition-all">
                Start MCQs
              </Link>
              <Link href="/flashcards" className="flex-1 text-center py-2.5 bg-zinc-100 text-zinc-700 text-[13px] font-medium rounded-xl hover:bg-zinc-200 active:scale-95 transition-all">
                Flashcards
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Study Modes */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest px-0.5">Study Modes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {modes.map((m) => (
            <Link key={m.name} href={m.href} className="block group">
              <div className={`card-hover bg-white border border-zinc-200/80 rounded-2xl p-4 h-full flex flex-col gap-3 ${m.hoverBg} transition-colors`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.color} shadow-sm`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={m.iconD} />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-zinc-900 leading-tight">{m.name}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">{m.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest px-0.5">Your Subjects</h2>
        <div className="space-y-2">
          {subjectConfig.map((s) => {
            const c = counts[s.name as keyof typeof counts];
            const total = c.mcqs + c.questions + c.flashcards;
            return (
              <Link key={s.name} href={`/mcqs?subject=${encodeURIComponent(s.name)}`} className={`block card-hover bg-white border border-zinc-200/80 rounded-2xl p-4 border-l-[3px] ${s.borderColor} hover:bg-zinc-50/50 transition-colors`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center shadow-sm shrink-0`}>
                      <span className="text-white font-bold text-[15px]">{s.name[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-semibold text-zinc-900">{s.name}</h3>
                      <p className="text-[11px] text-zinc-400 truncate">{s.board} &middot; {formatNumber(total)} items</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                    <div className="text-center">
                      <p className="text-[15px] font-bold text-zinc-900 tabular-nums">{c.mcqs}</p>
                      <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-medium">MCQs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[15px] font-bold text-zinc-900 tabular-nums">{c.questions}</p>
                      <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-medium">Qs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[15px] font-bold text-zinc-900 tabular-nums">{formatNumber(c.flashcards)}</p>
                      <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-medium">Cards</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick tip */}
      <section className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-indigo-900">Study tip</p>
          <p className="text-[12px] text-indigo-600/80 mt-0.5 leading-relaxed">
            {tip}
          </p>
        </div>
      </section>
    </div>
  );
}
