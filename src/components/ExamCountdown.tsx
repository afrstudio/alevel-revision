"use client";
import { useState, useEffect } from "react";

// Maths: Edexcel (9MA0) | Biology: Edexcel (9BN0) | Chemistry: OCR (H432)
const exams = [
  { subject: "Chemistry", paper: "Paper 1", board: "OCR", date: new Date("2026-06-02T09:00:00"), color: "teal" as const },
  { subject: "Maths", paper: "Paper 1", board: "Edexcel", date: new Date("2026-06-03T13:30:00"), color: "blue" as const },
  { subject: "Biology", paper: "Paper 1", board: "Edexcel", date: new Date("2026-06-04T13:30:00"), color: "emerald" as const },
  { subject: "Chemistry", paper: "Paper 2", board: "OCR", date: new Date("2026-06-09T09:00:00"), color: "teal" as const },
  { subject: "Maths", paper: "Paper 2", board: "Edexcel", date: new Date("2026-06-11T13:30:00"), color: "blue" as const },
  { subject: "Biology", paper: "Paper 2", board: "Edexcel", date: new Date("2026-06-12T09:00:00"), color: "emerald" as const },
  { subject: "Chemistry", paper: "Paper 3", board: "OCR", date: new Date("2026-06-15T09:00:00"), color: "teal" as const },
  { subject: "Biology", paper: "Paper 3", board: "Edexcel", date: new Date("2026-06-16T09:00:00"), color: "emerald" as const },
  { subject: "Maths", paper: "Paper 3", board: "Edexcel", date: new Date("2026-06-18T13:30:00"), color: "blue" as const },
];

const colorStyles = {
  blue: {
    bg: "bg-gradient-to-br from-blue-500/10 to-blue-600/5",
    border: "border-blue-200/60",
    days: "text-blue-600",
    dot: "bg-blue-500",
    label: "text-blue-900",
    sub: "text-blue-600/70",
  },
  emerald: {
    bg: "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5",
    border: "border-emerald-200/60",
    days: "text-emerald-600",
    dot: "bg-emerald-500",
    label: "text-emerald-900",
    sub: "text-emerald-600/70",
  },
  teal: {
    bg: "bg-gradient-to-br from-teal-500/10 to-teal-600/5",
    border: "border-teal-200/60",
    days: "text-teal-600",
    dot: "bg-teal-500",
    label: "text-teal-900",
    sub: "text-teal-600/70",
  },
};

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
      <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 px-5 py-4 text-center">
        <p className="text-sm font-semibold text-emerald-800">All exams done! Well done, Yabi.</p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest px-0.5">Your Exams</h2>
      <div className="grid grid-cols-3 gap-2">
        {upcoming.map((exam, i) => {
          const days = getDaysLeft(exam.date, now);
          const s = colorStyles[exam.color];
          const shortSubject = exam.subject === "Chemistry" ? "Chem" : exam.subject === "Biology" ? "Bio" : "Maths";
          const shortPaper = exam.paper.replace("Paper ", "P");
          return (
            <div
              key={i}
              className={`${s.bg} border ${s.border} rounded-xl px-3 py-2.5 transition-colors`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-[12px] font-semibold ${s.label}`}>{shortSubject} {shortPaper}</p>
                <span className={`text-[12px] font-bold tabular-nums ${s.days}`}>{days}d</span>
              </div>
              <p className={`text-[10px] ${s.sub} mt-0.5`}>
                {exam.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
