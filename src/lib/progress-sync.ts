import { supabase } from "./supabase";
import type { ProgressData } from "./progress";

const TABLE = "progress";
const ROW_ID = "yabi";

/** Fetch progress from Supabase */
export async function fetchFromSupabase(): Promise<ProgressData | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("data")
      .eq("id", ROW_ID)
      .single();
    if (error || !data) return null;
    return data.data as ProgressData;
  } catch {
    return null;
  }
}

/** Push progress to Supabase (upsert) */
async function pushToSupabase(progress: ProgressData): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from(TABLE).upsert({
      id: ROW_ID,
      data: progress,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Silent fail — localStorage is the source of truth
  }
}

/** Debounced push — waits 2s after last call before actually pushing */
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function debouncedPush(progress: ProgressData): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    pushToSupabase(progress);
  }, 2000);
}

/** Count total items in a progress object (for conflict resolution) */
function itemCount(p: ProgressData): number {
  return (
    (p.mcqAttempts?.length || 0) +
    (p.flashcardReviews?.length || 0) +
    (p.questionAttempts?.length || 0) +
    (p.cameraAttempts?.length || 0) +
    (p.paperViews?.length || 0)
  );
}

/** Sync on initial load — reconcile localStorage and Supabase */
export async function syncOnLoad(
  local: ProgressData,
  saveLocal: (data: ProgressData) => void,
): Promise<ProgressData> {
  const remote = await fetchFromSupabase();

  // No Supabase connection or no remote data — push local up
  if (!remote) {
    if (itemCount(local) > 0) {
      pushToSupabase(local);
    }
    return local;
  }

  const localCount = itemCount(local);
  const remoteCount = itemCount(remote);

  // Local is empty (new device / cleared browser) — restore from Supabase
  if (localCount === 0 && remoteCount > 0) {
    saveLocal(remote);
    return remote;
  }

  // Both have data — pick the one with more activity (most recent wins)
  if (remoteCount > localCount) {
    saveLocal(remote);
    return remote;
  }

  // Local has more or equal — push local to Supabase
  if (localCount >= remoteCount) {
    pushToSupabase(local);
  }

  return local;
}
