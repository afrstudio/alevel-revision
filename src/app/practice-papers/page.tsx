"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Paper {
  filename: string;
  msFilename: string;
  board: string;
  subject: string;
  title: string;
  set: string;
  marks: number;
  time: string;
  url: string;
  msUrl: string;
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

  // Group by subject → paper title
  const grouped = filtered.reduce<Record<string, Record<string, Paper[]>>>((acc, p) => {
    if (!acc[p.subject]) acc[p.subject] = {};
    if (!acc[p.subject][p.title]) acc[p.subject][p.title] = [];
    acc[p.subject][p.title].push(p);
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
            Exam-style papers with separate mark schemes
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

      {/* Paper packs grouped by subject → paper type */}
      {Object.entries(grouped).map(([subject, paperTypes]) => (
        <section key={subject} className="space-y-4">
          <h2 className={`text-lg font-semibold ${subjectText[subject] || "text-zinc-900"}`}>
            {subject}
          </h2>
          {Object.entries(paperTypes).map(([title, titlePapers]) => (
            <div key={title} className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-500 px-1">{title}</h3>
              <div className="space-y-3">
            {titlePapers.map((p) => (
              <div
                key={p.filename}
                className={`rounded-xl border ${subjectBorders[p.subject] || "border-zinc-200"} bg-white shadow-sm overflow-hidden`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${subjectColors[p.subject] || "bg-zinc-500"} flex items-center justify-center shrink-0`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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
                    </div>
                  </div>

                  {/* QP + MS download buttons */}
                  <div className="flex gap-2">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Question Paper
                    </a>
                    <a
                      href={p.msUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-200 text-zinc-700 text-xs font-medium hover:bg-zinc-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mark Scheme
                    </a>
                  </div>
                </div>
              </div>
            ))}
              </div>
            </div>
          ))}
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
