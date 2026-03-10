"use client";
import { useState, useEffect } from "react";

// Maths: Edexcel (9MA0) | Biology: Edexcel (9BN0) | Chemistry: OCR (H432)
const exams = [
  {
    subject: "Chemistry",
    paper: "Paper 1",
    subtitle: "Periodic Table, Elements & Physical Chemistry",
    board: "OCR",
    date: new Date("2026-06-02T09:00:00"),
    color: "bg-teal-500",
    badgeColor: "text-teal-700 bg-teal-50",
  },
  {
    subject: "Maths",
    paper: "Paper 1",
    subtitle: "Pure Mathematics 1",
    board: "Edexcel",
    date: new Date("2026-06-03T13:30:00"),
    color: "bg-indigo-500",
    badgeColor: "text-indigo-700 bg-indigo-50",
  },
  {
    subject: "Biology",
    paper: "Paper 1",
    subtitle: "Natural Environment & Species Survival",
    board: "Edexcel",
    date: new Date("2026-06-04T13:30:00"),
    color: "bg-emerald-500",
    badgeColor: "text-emerald-700 bg-emerald-50",
  },
  {
    subject: "Chemistry",
    paper: "Paper 2",
    subtitle: "Synthesis & Analytical Techniques",
    board: "OCR",
    date: new Date("2026-06-09T09:00:00"),
    color: "bg-teal-500",
    badgeColor: "text-teal-700 bg-teal-50",
  },
  {
    subject: "Maths",
    paper: "Paper 2",
    subtitle: "Pure Mathematics 2",
    board: "Edexcel",
    date: new Date("2026-06-11T13:30:00"),
    color: "bg-indigo-500",
    badgeColor: "text-indigo-700 bg-indigo-50",
  },
  {
    subject: "Biology",
    paper: "Paper 2",
    subtitle: "Energy, Exercise & Co-ordination",
    board: "Edexcel",
    date: new Date("2026-06-12T09:00:00"),
    color: "bg-emerald-500",
    badgeColor: "text-emerald-700 bg-emerald-50",
  },
  {
    subject: "Chemistry",
    paper: "Paper 3",
    subtitle: "Unified Chemistry",
    board: "OCR",
    date: new Date("2026-06-15T09:00:00"),
    color: "bg-teal-500",
    badgeColor: "text-teal-700 bg-teal-50",
  },
  {
    subject: "Biology",
    paper: "Paper 3",
    subtitle: "General & Practical Applications in Biology",
    board: "Edexcel",
    date: new Date("2026-06-16T09:00:00"),
    color: "bg-emerald-500",
    badgeColor: "text-emerald-700 bg-emerald-50",
  },
  {
    subject: "Maths",
    paper: "Paper 3",
    subtitle: "Statistics & Mechanics",
    board: "Edexcel",
    date: new Date("2026-06-18T13:30:00"),
    color: "bg-indigo-500",
    badgeColor: "text-indigo-700 bg-indigo-50",
  },
];

function getDaysLeft(date: Date, now: Date): number {
  const diff = date.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function ExamCountdown() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

  const upcoming = exams
    .filter((e) => e.date > now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (upcoming.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-5 text-center">
        <p className="text-sm font-semibold text-zinc-900">All exams completed!</p>
        <p className="text-xs text-zinc-500 mt-1">Well done, Yabi.</p>
      </section>
    );
  }

  const next = upcoming[0];
  const daysLeft = getDaysLeft(next.date, now);

  return (
    <section className="space-y-3">
      <div className="px-1">
        <h2 className="text-lg font-semibold text-zinc-900">Exam Countdown</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Edexcel Maths &amp; Biology &middot; OCR Chemistry &middot; 2026</p>
      </div>

      {/* Next exam hero card */}
      <div className={`rounded-2xl p-5 text-white ${next.color}`}>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-75 mb-3">
          Next exam
        </p>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-bold leading-tight">
              {next.subject} · {next.paper}
            </h3>
            <p className="text-sm opacity-80 mt-1 leading-snug">{next.subtitle}</p>
            <p className="text-xs opacity-70 mt-2">
              {next.date.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              &middot;{" "}
              {next.date.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              &middot; {next.board}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-5xl font-bold tabular-nums leading-none">{daysLeft}</span>
            <p className="text-xs opacity-75 uppercase tracking-widest mt-1">days</p>
          </div>
        </div>
      </div>

      {/* Remaining exams list */}
      {upcoming.length > 1 && (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden divide-y divide-zinc-100">
          {upcoming.slice(1).map((exam, i) => {
            const days = getDaysLeft(exam.date, now);
            return (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">
                    {exam.subject} · {exam.paper}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {exam.date.toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    &middot; {exam.board}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ml-3 ${exam.badgeColor}`}
                >
                  {days}d
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
