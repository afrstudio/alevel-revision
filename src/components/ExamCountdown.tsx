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
  blue: "from-blue-500 to-blue-600",
  emerald: "from-emerald-500 to-emerald-600",
  teal: "from-teal-500 to-teal-600",
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
          const gradient = colorStyles[exam.color];
          const shortSubject = exam.subject === "Chemistry" ? "Chem" : exam.subject === "Biology" ? "Bio" : "Maths";
          const shortPaper = exam.paper.replace("Paper ", "P");
          return (
            <div
              key={i}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} px-3 py-2.5 text-white shadow-sm`}
            >
              <div className="absolute -right-2 -top-2 w-10 h-10 rounded-full bg-white/10" />
              <div className="relative flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold leading-tight">{shortSubject} {shortPaper}</p>
                  <p className="text-[10px] text-white/60 mt-0.5">
                    {exam.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <span className="text-[14px] font-bold tabular-nums shrink-0">{days}d</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
