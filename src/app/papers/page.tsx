"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import manifest from "@/data/papers-manifest.json";

type Manifest = Record<string, Record<string, Record<string, Record<string, { pages: string[]; pageCount: number }>>>>;
const papers = manifest as Manifest;

const subjectColors: Record<string, { bg: string; text: string; border: string }> = {
  Maths: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
  Biology: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  Chemistry: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200" },
};

export default function PastPapersPage() {
  const [subject, setSubject] = useState<string | null>(null);
  const [board, setBoard] = useState<string | null>(null);
  const [paper, setPaper] = useState<string | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const subjects = Object.keys(papers);
  const boards = useMemo(() => { if (!subject || !papers[subject]) return []; return Object.keys(papers[subject]); }, [subject]);
  const papersList = useMemo(() => { if (!subject || !board || !papers[subject]?.[board]) return []; return Object.keys(papers[subject][board]); }, [subject, board]);
  const sessions = useMemo(() => {
    if (!subject || !board || !paper || !papers[subject]?.[board]?.[paper]) return [];
    return Object.keys(papers[subject][board][paper]).sort((a, b) => {
      const yearA = parseInt(a.match(/\d{4}/)?.[0] || "0");
      const yearB = parseInt(b.match(/\d{4}/)?.[0] || "0");
      return yearB - yearA;
    });
  }, [subject, board, paper]);
  const pages = useMemo(() => {
    if (!subject || !board || !paper || !session) return [];
    return papers[subject]?.[board]?.[paper]?.[session]?.pages || [];
  }, [subject, board, paper, session]);

  const goBack = () => {
    if (session) { setSession(null); setCurrentPage(0); }
    else if (paper) setPaper(null);
    else if (board) setBoard(null);
    else if (subject) setSubject(null);
  };

  const breadcrumb = [subject, board, paper, session].filter(Boolean);

  const formatSession = (s: string) => s.replace(/-qp$/i, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Viewing a paper
  if (session && pages.length > 0) {
    return (
      <div className="fade-in space-y-3">
        <div className="flex items-center gap-2">
          <button onClick={goBack} className="text-[12px] text-zinc-400 hover:text-zinc-700 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            Back
          </button>
          <span className="text-[12px] text-zinc-400 truncate">{subject} / {board} / {paper} / {formatSession(session)}</span>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="px-3 py-2 rounded-xl text-[13px] font-medium bg-white border border-zinc-200 text-zinc-600 disabled:opacity-30 active:scale-95 transition-all">Prev</button>
          <span className="text-[13px] text-zinc-500">Page {currentPage + 1} of {pages.length}</span>
          <button onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))} disabled={currentPage === pages.length - 1} className="px-3 py-2 rounded-xl text-[13px] font-medium bg-white border border-zinc-200 text-zinc-600 disabled:opacity-30 active:scale-95 transition-all">Next</button>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pages[currentPage]} alt={`Page ${currentPage + 1}`} className="w-full" style={{ imageRendering: "auto" }} />
        </div>

        <div className="flex items-center justify-between pb-2">
          <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="px-4 py-2.5 rounded-xl text-[13px] font-medium bg-white border border-zinc-200 text-zinc-600 disabled:opacity-30 active:scale-95 transition-all min-h-[48px]">Previous Page</button>
          <button onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))} disabled={currentPage === pages.length - 1} className="px-4 py-2.5 rounded-xl text-[13px] font-medium bg-zinc-900 text-white disabled:opacity-30 active:scale-95 transition-all min-h-[48px]">Next Page</button>
        </div>

        {/* Mark with Camera */}
        <Link
          href={`/camera?context=${encodeURIComponent(`${subject} - ${board} - ${paper} - ${formatSession(session)} - Page ${currentPage + 1}`)}&subject=${encodeURIComponent(subject || "")}`}
          className="flex items-center justify-center gap-2 w-full min-h-[52px] bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-semibold text-[14px] transition-all duration-150 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
          Attempt this question, then mark with AI Camera
        </Link>

        <div className="flex gap-1.5 overflow-x-auto pb-2 hide-scrollbar">
          {pages.map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i)} className={`shrink-0 w-9 h-9 rounded-lg text-[11px] font-medium transition-all active:scale-95 ${i === currentPage ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}>{i + 1}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-4 pt-2">
      <div>
        <div className="flex items-center gap-2">
          {breadcrumb.length > 0 && (
            <button onClick={goBack} className="text-[12px] text-zinc-400 hover:text-zinc-700 flex items-center gap-1 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              Back
            </button>
          )}
        </div>
        <div className="inline-block px-3 py-1 bg-zinc-200/50 text-zinc-600 rounded-md text-xs font-semibold tracking-wide uppercase mb-2 mt-1">Past Papers</div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Exam Practice</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{!subject ? "Select a subject to browse real exam papers." : breadcrumb.join(" / ")}</p>
      </div>

      {!subject && (
        <div className="space-y-3">
          {subjects.map((s) => {
            const colors = subjectColors[s] || subjectColors.Maths;
            const boardCount = Object.keys(papers[s] || {}).length;
            let paperCount = 0;
            Object.values(papers[s] || {}).forEach((b) => Object.values(b).forEach((p) => Object.values(p).forEach(() => paperCount++)));
            return (
              <button key={s} onClick={() => setSubject(s)} className={`w-full flex items-center gap-3.5 bg-white rounded-2xl p-4 border ${colors.border} text-left active:scale-[0.98] transition-all shadow-sm hover:border-zinc-300`}>
                <div className={`shrink-0 w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}><span className={`text-base font-bold ${colors.text}`}>{s.charAt(0)}</span></div>
                <div className="flex-1"><h2 className="text-[15px] font-semibold text-zinc-900">{s}</h2><p className="text-[12px] text-zinc-500 mt-0.5">{boardCount} boards, {paperCount} papers</p></div>
                <svg className="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            );
          })}
        </div>
      )}

      {subject && !board && (
        <div className="space-y-2">
          {boards.map((b) => {
            let count = 0;
            Object.values(papers[subject][b]).forEach((p) => Object.values(p).forEach(() => count++));
            return (
              <button key={b} onClick={() => setBoard(b)} className="w-full flex items-center justify-between bg-white rounded-2xl p-3.5 border border-zinc-200 text-left active:scale-[0.98] transition-all shadow-sm hover:border-zinc-300">
                <div><h3 className="text-[14px] font-semibold text-zinc-900">{b}</h3><p className="text-[12px] text-zinc-500 mt-0.5">{count} papers</p></div>
                <svg className="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            );
          })}
        </div>
      )}

      {subject && board && !paper && (
        <div className="space-y-2">
          {papersList.map((p) => {
            const count = Object.keys(papers[subject][board][p]).length;
            return (
              <button key={p} onClick={() => setPaper(p)} className="w-full flex items-center justify-between bg-white rounded-2xl p-3.5 border border-zinc-200 text-left active:scale-[0.98] transition-all shadow-sm hover:border-zinc-300">
                <div><h3 className="text-[14px] font-semibold text-zinc-900">{p}</h3><p className="text-[12px] text-zinc-500 mt-0.5">{count} sessions</p></div>
                <svg className="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            );
          })}
        </div>
      )}

      {subject && board && paper && !session && (
        <div className="space-y-2">
          {sessions.map((s) => {
            const info = papers[subject][board][paper][s];
            return (
              <button key={s} onClick={() => { setSession(s); setCurrentPage(0); }} className="w-full flex items-center justify-between bg-white rounded-2xl p-3.5 border border-zinc-200 text-left active:scale-[0.98] transition-all shadow-sm hover:border-zinc-300">
                <div><h3 className="text-[14px] font-semibold text-zinc-900">{formatSession(s)}</h3><p className="text-[12px] text-zinc-500 mt-0.5">{info.pageCount} pages</p></div>
                <svg className="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
