"use client";

import { useState, useEffect } from "react";
import type { SubjectData, Subject } from "@/types";

const cache: Partial<Record<Subject, SubjectData>> = {};

export function useSubjectData(subject: Subject | null) {
  const [data, setData] = useState<SubjectData | null>(
    subject ? cache[subject] ?? null : null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subject) {
      setData(null);
      return;
    }
    if (cache[subject]) {
      setData(cache[subject]!);
      return;
    }

    setLoading(true);
    fetch(`/data/A-Level-${subject}.json`)
      .then((r) => r.json())
      .then((d: SubjectData) => {
        // Merge original_flashcards into flashcards with dedup
        const allFlashcards = [...d.flashcards];
        const existingIds = new Set(allFlashcards.map((f) => f.id));
        if (d.original_flashcards) {
          for (const fc of d.original_flashcards) {
            if (!existingIds.has(fc.id)) {
              allFlashcards.push(fc);
              existingIds.add(fc.id);
            }
          }
        }
        d.flashcards = allFlashcards;
        cache[subject] = d;
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [subject]);

  return { data, loading };
}
