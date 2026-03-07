"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Paper {
  filename: string;
  board: string;
  subject: string;
  title: string;
  set: string;
  marks: number;
  time: string;
  url: string;
}

const subjectColors: Record<string, string> = {
  Maths: "bg-indigo-500",
  Biology: "bg-emerald-500",
  Chemistry: "bg-teal-500",
};

const subjectBorders: Record<string, string> = {
  Maths: "border-indigo-200",
  Biology: "border-emerald-200",
  Chemistry: "border-teal-200",
};

const subjectText: Record<string, string> = {
  Maths: "text-indigo-600",
  Biology: "text-emerald-600",
  Chemistry: "text-teal-600",
};

export default function PracticePapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    fetch("/data/generated-papers.json")
      .then((r) => r.json())
      .then(setPapers)
      .catch(() => {});
  }, []);

  const subjects = ["All", "Maths", "Biology", "Chemistry"];
  const filtered = filter === "All" ? papers : papers.filter((p) => p.subject === filter);

  const grouped = filtered.reduce<Record<string, Paper[]>>((acc, p) => {
    const key = p.subject;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-3 pt-4">
        <Link href="/" className="text-zinc-400 hover:text-zinc-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Practice Papers</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Original exam-style papers with full mark schemes
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === s
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Paper cards grouped by subject */}
      {Object.entries(grouped).map(([subject, subjectPapers]) => (
        <section key={subject} className="space-y-3">
          <h2 className={`text-base font-semibold ${subjectText[subject] || "text-zinc-900"}`}>
            {subject}
          </h2>
          <div className="space-y-3">
            {subjectPapers.map((p) => (
              <a
                key={p.filename}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block rounded-xl border ${subjectBorders[p.subject] || "border-zinc-200"} bg-white shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="p-4 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${subjectColors[p.subject] || "bg-zinc-500"} flex items-center justify-center shrink-0`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-zinc-900 truncate">{p.title}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-xs font-medium text-zinc-500 shrink-0">
                        {p.set}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {p.board} &middot; {p.marks} marks &middot; {p.time}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Includes full mark scheme
                    </p>
                  </div>
                  <div className="shrink-0 text-zinc-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}

      {papers.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          Loading papers...
        </div>
      )}
    </div>
  );
}
