"use client";

import type { Subject } from "@/types";

interface SubjectPickerProps {
  title: string;
  subjects: { name: Subject; count: string; color: string; bg: string }[];
  onSelect: (subject: Subject) => void;
}

export default function SubjectPicker({ title, subjects, onSelect }: SubjectPickerProps) {
  return (
    <div className="space-y-4 fade-in pt-2 md:pt-0">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
        <p className="text-sm text-zinc-500">Select a subject to begin</p>
      </div>
      <div className="space-y-3">
        {subjects.map((s) => (
          <button
            key={s.name}
            onClick={() => onSelect(s.name)}
            className="w-full flex items-center gap-3.5 bg-white rounded-2xl p-4 border border-zinc-200 text-left group shadow-sm hover:border-zinc-300 active:scale-[0.98] transition-all"
          >
            <div className={`shrink-0 w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
              <span className={`text-base font-bold ${s.color}`}>{s.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-semibold text-zinc-900">{s.name}</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5 font-medium">{s.count}</p>
            </div>
            <svg className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
