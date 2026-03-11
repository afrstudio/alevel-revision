"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSubjectData } from "@/lib/use-data";
import type { Subject } from "@/types";
import QuestionPractice from "@/components/QuestionPractice";
import SubjectPicker from "@/components/SubjectPicker";

const subjects = [
  { name: "Maths" as Subject, count: "279 questions", color: "text-indigo-600", bg: "bg-indigo-50" },
  { name: "Biology" as Subject, count: "342 questions", color: "text-emerald-600", bg: "bg-emerald-50" },
  { name: "Chemistry" as Subject, count: "251 questions", color: "text-teal-600", bg: "bg-teal-50" },
];

const validSubjects: Subject[] = ["Maths", "Biology", "Chemistry"];

function QuestionsPageInner() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject");
  const topicParam = searchParams.get("topic");

  const initialSubject = validSubjects.find((s) => s === subjectParam) || null;
  const [selected, setSelected] = useState<Subject | null>(initialSubject);
  const { data, loading } = useSubjectData(selected);

  useEffect(() => {
    if (initialSubject && !selected) setSelected(initialSubject);
  }, [initialSubject, selected]);

  if (!selected) {
    return <SubjectPicker title="Written Questions" subjects={subjects} onSelect={setSelected} />;
  }

  if (loading || !data) {
    return (
      <div className="fade-in">
        <button
          onClick={() => setSelected(null)}
          className="text-xs text-zinc-400 hover:text-zinc-700 mb-3 flex items-center gap-1 min-h-[44px] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          Back
        </button>
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <button
        onClick={() => setSelected(null)}
        className="text-xs text-zinc-400 hover:text-zinc-700 mb-3 flex items-center gap-1 min-h-[44px] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Back
      </button>
      <QuestionPractice questions={data.original_questions} subject={selected} initialTopic={topicParam || undefined} />
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense>
      <QuestionsPageInner />
    </Suspense>
  );
}
