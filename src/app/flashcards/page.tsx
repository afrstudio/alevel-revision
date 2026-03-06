"use client";

import { useState } from "react";
import { getFlashcards } from "@/lib/data";
import type { Subject, Flashcard } from "@/types";
import FlashcardPractice from "@/components/FlashcardPractice";

const subjects: Subject[] = ["Maths", "Biology", "Chemistry"];
const colors: Record<Subject, string> = {
  Maths: "border-blue-500/50 hover:border-blue-400",
  Biology: "border-green-500/50 hover:border-green-400",
  Chemistry: "border-purple-500/50 hover:border-purple-400",
};

export default function FlashcardsPage() {
  const [selected, setSelected] = useState<Subject | null>(null);

  if (!selected) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl md:text-2xl font-bold">Flashcards</h1>
        <p className="text-gray-400 text-sm">Choose a subject:</p>
        <div className="grid grid-cols-1 gap-3">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSelected(s)}
              className={`bg-gray-900 border ${colors[s]} rounded-xl p-4 md:p-6 transition-colors text-left active:scale-[0.98]`}
            >
              <h2 className="text-base md:text-lg font-semibold">{s}</h2>
              <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                {getFlashcards(s).length} cards
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const flashcards: Flashcard[] = getFlashcards(selected);

  return (
    <div>
      <button
        onClick={() => setSelected(null)}
        className="text-sm text-gray-400 hover:text-white mb-3 flex items-center gap-1 min-h-[44px]"
      >
        ← Back to subjects
      </button>
      <FlashcardPractice flashcards={flashcards} />
    </div>
  );
}
