"use client";

import { useEffect } from "react";
import { initProgress } from "@/lib/progress";

export function ProgressSync() {
  useEffect(() => {
    initProgress();
  }, []);
  return null;
}
