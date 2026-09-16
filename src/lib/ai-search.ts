// Shared helpers for the game AIs' time-boxed iterative-deepening search.
// Each game keeps its own minimax/evaluation logic, but both enforce the
// same wall-clock search ceiling so a slow position can never hang the UI.

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTIES: { id: Difficulty; name: string }[] = [
  { id: "easy", name: "Easy" },
  { id: "medium", name: "Medium" },
  { id: "hard", name: "Hard" },
];

export function isDifficulty(value: string | null): value is Difficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

// Maximum time a single AI move is allowed to search before it must return
// the best move found so far, regardless of the configured search depth.
export const SEARCH_TIME_LIMIT_MS: Record<Difficulty, number> = {
  easy: 300,
  medium: 700,
  hard: 1500,
};

// Thrown internally to unwind a search that has exceeded its time budget.
// Callers should catch it, discard the in-progress (incomplete) depth, and
// fall back to the best move found at the last fully-searched depth.
export class SearchTimeout extends Error {}

export function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

// Runs `searchAtDepth` for depth 1, 2, ... up to maxDepth, keeping the
// result of the last depth that completed before `deadline`. Depth 1 is
// assumed to always complete (it's the guaranteed fallback); deeper passes
// that throw SearchTimeout are discarded in favor of the previous depth's
// result. Both games' AIs share this so the "abort a depth, fall back to
// the last complete one" logic only needs to be correct in one place.
export function runIterativeDeepening<T>(
  maxDepth: number,
  deadline: number,
  searchAtDepth: (depth: number) => T
): T {
  let best = searchAtDepth(1);
  for (let depth = 2; depth <= maxDepth; depth++) {
    if (nowMs() > deadline) break;
    try {
      best = searchAtDepth(depth);
    } catch (error) {
      if (error instanceof SearchTimeout) break;
      throw error;
    }
  }
  return best;
}
