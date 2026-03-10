"use client";
import { useState, useEffect } from "react";

// Maths: Edexcel (9MA0) | Biology: Edexcel (9BN0) | Chemistry: OCR (H432)
const exams = [
  { subject: "Chemistry", paper: "Paper 1", board: "OCR", date: new Date("2026-06-02T09:00:00"), gradient: "from-teal-500 to-teal-600", dotColor: "bg-teal-400", textColor: "text-teal-600" },
  { subject: "Maths", paper: "Paper 1", board: "Edexcel", date: new Date("2026-06-03T13:30:00"), gradient: "from-indigo-500 to-indigo-600", dotColor: "bg-indigo-400", textColor: "text-indigo-600" },
  { subject: "Biology", paper: "Paper 1", board: "Edexcel", date: new Date("2026-06-04T13:30:00"), gradient: "from-emerald-500 to-emerald-600", dotColor: "bg-emerald-400", textColor: "text-emerald-600" },
  { subject: "Chemistry", paper: "Paper 2", board: "OCR", date: new Date("2026-06-09T09:00:00"), gradient: "from-teal-500 to-teal-600", dotColor: "bg-teal-400", textColor: "text-teal-600" },
  { subject: "Maths", paper: "Paper 2", board: "Edexcel", date: new Date("2026-06-11T13:30:00"), gradient: "from-indigo-500 to-indigo-600", dotColor: "bg-indigo-400", textColor: "text-indigo-600" },
  { subject: "Biology", paper: "Paper 2", board: "Edexcel", date: new Date("2026-06-12T09:00:00"), gradient: "from-emerald-500 to-emerald-600", dotColor: "bg-emerald-400", textColor: "text-emerald-600" },
  { subject: "Chemistry", paper: "Paper 3", board: "OCR", date: new Date("2026-06-15T09:00:00"), gradient: "from-teal-500 to-teal-600", dotColor: "bg-teal-400", textColor: "text-teal-600" },
  { subject: "Biology", paper: "Paper 3", board: "Edexcel", date: new Date("2026-06-16T09:00:00"), gradient: "from-emerald-500 to-emerald-600", dotColor: "bg-emerald-400", textColor: "text-emerald-600" },
  { subject: "Maths", paper: "Paper 3", board: "Edexcel", date: new Date("2026-06-18T13:30:00"), gradient: "from-indigo-500 to-indigo-600", dotColor: "bg-indigo-400", textColor: "text-indigo-600" },
];

function getDaysLeft(date: Date, now: Date): number {
  const diff = date.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function ExamCountdown() {
  const [now, setNow] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState(false);

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
      <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 px-5 py-4 text-center">
        <p className="text-sm font-semibold text-emerald-800">All exams done! Well done, Yabi.</p>
      </div>
    );
  }

  const next = upcoming[0];
  const daysLeft = getDaysLeft(next.date, now);
  const rest = upcoming.slice(1);
  const isUrgent = daysLeft <= 14;

  return (
    <section className="space-y-2">
      {/* Hero card — gradient with subtle depth */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${next.gradient} p-5 text-white shadow-sm`}>
        {/* Decorative circles */}
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -right-2 top-8 w-12 h-12 rounded-full bg-white/5" />

        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/60">Next exam</p>
            <p className="text-lg font-bold mt-1 leading-tight">{next.subject} {next.paper}</p>
            <p className="text-[12px] text-white/70 mt-1.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {next.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long" })} &middot; {next.board}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className={`font-bold tabular-nums leading-none ${daysLeft <= 7 ? "text-5xl" : "text-4xl"}`}>{daysLeft}</span>
            <p className="text-[10px] text-white/60 uppercase tracking-[0.15em] mt-1">{isUrgent ? "days left" : "days"}</p>
          </div>
        </div>
      </div>

      {/* Expandable remaining exams */}
      {rest.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100/80 transition-colors text-[12px] text-zinc-500 font-medium"
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {rest.length} more exam{rest.length !== 1 ? "s" : ""} this summer
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expanded && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-1 fade-in">
              {rest.map((exam, i) => {
                const days = getDaysLeft(exam.date, now);
                const shortSubject = exam.subject === "Chemistry" ? "Chem" : exam.subject === "Biology" ? "Bio" : exam.subject;
                const shortPaper = exam.paper.replace("Paper ", "P");
                return (
                  <div key={i} className="flex items-center gap-2 bg-white border border-zinc-100 rounded-xl px-3 py-2.5 hover:border-zinc-200 transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${exam.dotColor}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-zinc-800">{shortSubject} {shortPaper}</p>
                      <p className="text-[10px] text-zinc-400">
                        {exam.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span className={`text-[11px] font-bold shrink-0 ${exam.textColor}`}>{days}d</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
