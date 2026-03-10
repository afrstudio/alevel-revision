"use client";
import { useState, useEffect, useCallback, useRef } from "react";

interface ExamTimerProps {
  /** Time in seconds */
  duration: number;
  /** Called when timer hits 0 */
  onTimeUp: () => void;
  /** Reset trigger — change this value to reset the timer */
  resetKey: string | number;
  /** Whether timer is enabled */
  enabled: boolean;
}

export default function ExamTimer({ duration, onTimeUp, resetKey, enabled }: ExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const [running, setRunning] = useState(false);
  const calledTimeUp = useRef(false);

  // Reset when question changes or duration changes
  useEffect(() => {
    setSecondsLeft(duration);
    setRunning(enabled);
    calledTimeUp.current = false;
  }, [resetKey, duration, enabled]);

  useEffect(() => {
    if (!running || !enabled) return;
    if (secondsLeft <= 0) {
      if (!calledTimeUp.current) {
        calledTimeUp.current = true;
        onTimeUp();
      }
      return;
    }
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [running, secondsLeft, enabled, onTimeUp]);

  if (!enabled) return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = duration > 0 ? (secondsLeft / duration) * 100 : 0;
  const isLow = secondsLeft <= 30;
  const isUp = secondsLeft <= 0;

  return (
    <div className={`flex items-center gap-3 px-3.5 py-2 rounded-xl border transition-all ${
      isUp ? "bg-red-50 border-red-200" : isLow ? "bg-amber-50 border-amber-200 animate-pulse" : "bg-zinc-50 border-zinc-200"
    }`}>
      <svg className={`w-4 h-4 shrink-0 ${isUp ? "text-red-500" : isLow ? "text-amber-500" : "text-zinc-400"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="flex-1 min-w-0">
        <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isUp ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-indigo-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className={`text-sm font-mono font-semibold tabular-nums shrink-0 ${
        isUp ? "text-red-600" : isLow ? "text-amber-600" : "text-zinc-700"
      }`}>
        {isUp ? "Time's up!" : `${mins}:${secs.toString().padStart(2, "0")}`}
      </span>
      {!isUp && (
        <button
          onClick={() => setRunning((r) => !r)}
          className="text-[11px] text-zinc-400 hover:text-zinc-600 font-medium shrink-0"
        >
          {running ? "Pause" : "Resume"}
        </button>
      )}
    </div>
  );
}

interface TimerToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function TimerToggle({ enabled, onToggle }: TimerToggleProps) {
  const toggle = useCallback(() => onToggle(!enabled), [enabled, onToggle]);
  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all min-h-[36px] ${
        enabled
          ? "bg-amber-50 text-amber-700 border border-amber-200"
          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
      }`}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {enabled ? "Timed" : "Timer"}
    </button>
  );
}
