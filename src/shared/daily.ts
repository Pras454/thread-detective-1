// Pure daily-game logic, shared by client and server.
// No I/O here: every function is deterministic and unit-testable.

/** UTC date key 'YYYY-MM-DD'. All players share the same case on the same UTC day. */
export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Whole days since the Unix epoch (UTC midnight). */
export function dayNumber(dateStr: string): number {
  const ms = Date.parse(`${dateStr}T00:00:00.000Z`);
  return Math.floor(ms / 86_400_000);
}

/**
 * Deterministically picks the mystery index for a date.
 * Cycles through the bank in order, so the case changes every day
 * and repeats only after the whole bank has been shown.
 */
export function mysteryIndexForDate(dateStr: string, bankSize: number): number {
  if (bankSize <= 0) return 0;
  const n = dayNumber(dateStr);
  return ((n % bankSize) + bankSize) % bankSize;
}

/** The UTC date key of the day before `dateStr`. */
export function previousDateKey(dateStr: string): string {
  const ms = Date.parse(`${dateStr}T00:00:00.000Z`) - 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

export const BASE_POINTS = 100;
export const MAX_TIME_BONUS = 50;
/** One bonus point is lost per minute after the first view, down to zero bonus. */
export const BONUS_DECAY_SECONDS = 60;

/**
 * Points for an accusation. A correct accusation is worth 100 base points
 * plus a speed bonus of up to 50 (one point lost per minute since the player
 * first opened today's case). A wrong accusation scores 0.
 */
export function scoreForSolve(correct: boolean, elapsedSeconds: number): number {
  if (!correct) return 0;
  const elapsed = Math.max(0, elapsedSeconds);
  const bonus = Math.max(
    0,
    MAX_TIME_BONUS - Math.floor(elapsed / BONUS_DECAY_SECONDS)
  );
  return BASE_POINTS + bonus;
}

export type StreakInput = {
  streak: number;
  bestStreak: number;
  lastSolvedDate: string | null;
};

/**
 * Streak update for a finished day.
 * - Correct solve: streak continues only if the previous solve was yesterday,
 *   otherwise it restarts at 1.
 * - Wrong accusation: the day is spent unsolved, so the streak resets to 0.
 * The best streak only ever grows.
 */
export function updateStreak(
  prev: StreakInput,
  today: string,
  correct: boolean
): { streak: number; bestStreak: number } {
  if (!correct) {
    return { streak: 0, bestStreak: prev.bestStreak };
  }
  const continued =
    prev.lastSolvedDate !== null &&
    prev.lastSolvedDate === previousDateKey(today);
  const streak = continued ? prev.streak + 1 : 1;
  return { streak, bestStreak: Math.max(prev.bestStreak, streak) };
}
