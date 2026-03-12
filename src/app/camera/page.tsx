"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import CameraMarker from "@/components/CameraMarker";

function CameraPageInner() {
  const searchParams = useSearchParams();
  const initialContext = searchParams.get("context") || "";
  const initialSubject = searchParams.get("subject") || "";

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-col items-center text-center space-y-3 pt-4">
        <div className="relative w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center shadow-sm">
          <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
        </div>
        <div className="flex items-center space-x-2 text-blue-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <span className="text-xs font-semibold tracking-wider uppercase">AI Marking</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Scan your working out</h1>
        <p className="text-sm text-zinc-500 max-w-sm">
          Snap your working out and let&apos;s see if you actually know what you&apos;re doing.
        </p>
      </div>
      <CameraMarker initialSubject={initialSubject} initialContext={initialContext} />
    </div>
  );
}

export default function CameraPage() {
  return (
    <Suspense>
      <CameraPageInner />
    </Suspense>
  );
}
