import { redis } from '@devvit/web/server';
import { MYSTERIES } from '../data/mysteries';
import {
  dateKey,
  mysteryIndexForDate,
  scoreForSolve,
  updateStreak,
} from '../../shared/daily';
import type {
  CaseView,
  DayResult,
  LeaderboardEntry,
  Mystery,
  PlayerStats,
} from '../../shared/types';
import type { TodayVerdict } from '../../shared/api';

/** Per-day records auto-delete after 30 days (Devvit Rules: data minimization). */
export const DAY_TTL_SECONDS = 30 * 86_400;
/** Player stats/names auto-delete after 90 days of no play. */
export const STATS_TTL_SECONDS = 90 * 86_400;
/** First-view timestamps only matter for today's speed bonus. */
export const SEEN_TTL_SECONDS = 2 * 86_400;

export const LEADERBOARD_SIZE = 10;

export function todayKey(now: Date = new Date()): string {
  return dateKey(now);
}

export function mysteryForDate(date: string): Mystery {
  const mystery = MYSTERIES[mysteryIndexForDate(date, MYSTERIES.length)];
  if (!mystery) {
    throw new Error('Mystery bank is empty');
  }
  return mystery;
}

/** Strips the answer before a case is sent to the client. */
export function toCaseView(mystery: Mystery): CaseView {
  const { culpritId: _culpritId, solution: _solution, solutionSteps: _steps, ...rest } =
    mystery;
  return rest;
}

export function emptyStats(): PlayerStats {
  return {
    streak: 0,
    bestStreak: 0,
    played: 0,
    solved: 0,
    totalPoints: 0,
    lastSolvedDate: null,
    lastPlayedDate: null,
  };
}

const seenKey = (userId: string, date: string): string =>
  `td:seen:${userId}:${date}`;
const resultKey = (userId: string, date: string): string =>
  `td:result:${userId}:${date}`;
const statsKey = (userId: string): string => `td:stats:${userId}`;
const nameKey = (userId: string): string => `td:name:${userId}`;
const leaderboardKey = (date: string): string => `td:lb:${date}`;

function parseIntOr(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export async function getStats(userId: string): Promise<PlayerStats> {
  const record = await redis.hGetAll(statsKey(userId));
  if (!record) return emptyStats();
  return {
    streak: parseIntOr(record['streak'], 0),
    bestStreak: parseIntOr(record['bestStreak'], 0),
    played: parseIntOr(record['played'], 0),
    solved: parseIntOr(record['solved'], 0),
    totalPoints: parseIntOr(record['totalPoints'], 0),
    lastSolvedDate: record['lastSolvedDate'] ?? null,
    lastPlayedDate: record['lastPlayedDate'] ?? null,
  };
}

async function saveStats(userId: string, stats: PlayerStats): Promise<void> {
  await redis.hSet(statsKey(userId), {
    streak: String(stats.streak),
    bestStreak: String(stats.bestStreak),
    played: String(stats.played),
    solved: String(stats.solved),
    totalPoints: String(stats.totalPoints),
    lastSolvedDate: stats.lastSolvedDate ?? '',
    lastPlayedDate: stats.lastPlayedDate ?? '',
  });
  await redis.expire(statsKey(userId), STATS_TTL_SECONDS);
}

export async function saveUsername(userId: string, username: string): Promise<void> {
  await redis.set(nameKey(userId), username);
  await redis.expire(nameKey(userId), STATS_TTL_SECONDS);
}

export async function getTodayResult(
  userId: string,
  date: string
): Promise<DayResult | null> {
  const raw = await redis.get(resultKey(userId, date));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DayResult;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.suspectId === 'string' &&
      typeof parsed.correct === 'boolean' &&
      typeof parsed.points === 'number'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Records the first time a player opens today's case (used for the speed
 * bonus) and returns that timestamp. Later views return the stored value.
 */
export async function recordFirstSeen(
  userId: string,
  date: string,
  nowSeconds: number
): Promise<number> {
  await redis.set(seenKey(userId, date), String(nowSeconds), {
    nx: true,
    expiration: new Date((nowSeconds + SEEN_TTL_SECONDS) * 1000),
  });
  const stored = await redis.get(seenKey(userId, date));
  return stored ? parseIntOr(stored, nowSeconds) : nowSeconds;
}

export async function getLeaderboard(
  date: string,
  currentUserId: string | undefined,
  limit: number = LEADERBOARD_SIZE
): Promise<LeaderboardEntry[]> {
  const rows = await redis.zRange(leaderboardKey(date), 0, limit - 1, {
    by: 'rank',
    reverse: true,
  });
  if (rows.length === 0) return [];
  const names = await redis.mGet(rows.map((row) => nameKey(row.member)));
  return rows.map((row, index) => {
    const name = names[index];
    return {
      rank: index + 1,
      username: name ?? 'anonymous',
      points: row.score,
      isYou: currentUserId !== undefined && row.member === currentUserId,
    };
  });
}

/** 1-based rank on today's leaderboard (highest score first), or null. */
export async function getRank(
  date: string,
  userId: string
): Promise<number | null> {
  const [score, rank, total] = await Promise.all([
    redis.zScore(leaderboardKey(date), userId),
    redis.zRank(leaderboardKey(date), userId),
    redis.zCard(leaderboardKey(date)),
  ]);
  if (score === undefined || rank === undefined) return null;
  return total - rank;
}

export type AccusationOutcome = {
  result: DayResult;
  verdict: TodayVerdict;
  stats: PlayerStats;
};

/**
 * Records an accusation for a logged-in player. Returns null when the player
 * already accused today (the route turns that into a 409).
 */
export async function recordAccusation(
  userId: string,
  username: string | null,
  date: string,
  suspectId: string,
  mystery: Mystery,
  nowSeconds: number
): Promise<AccusationOutcome | null> {
  const existing = await getTodayResult(userId, date);
  if (existing) return null;

  const seenAt = await recordFirstSeen(userId, date, nowSeconds);
  const correct = suspectId === mystery.culpritId;
  const points = scoreForSolve(correct, nowSeconds - seenAt);

  const result: DayResult = { date, suspectId, correct, points, at: nowSeconds };
  await redis.set(resultKey(userId, date), JSON.stringify(result));
  await redis.expire(resultKey(userId, date), DAY_TTL_SECONDS);

  const prev = await getStats(userId);
  const { streak, bestStreak } = updateStreak(prev, date, correct);
  const stats: PlayerStats = {
    streak,
    bestStreak,
    played: prev.played + 1,
    solved: prev.solved + (correct ? 1 : 0),
    totalPoints: prev.totalPoints + points,
    lastSolvedDate: correct ? date : prev.lastSolvedDate,
    lastPlayedDate: date,
  };
  await saveStats(userId, stats);
  if (username) {
    await saveUsername(userId, username);
  }

  if (points > 0) {
    await redis.zAdd(leaderboardKey(date), { member: userId, score: points });
    await redis.expire(leaderboardKey(date), DAY_TTL_SECONDS);
  }

  const culprit = mystery.suspects.find((s) => s.id === mystery.culpritId);
  const rank = await getRank(date, userId);
  return {
    result,
    verdict: {
      correct,
      points,
      culpritId: mystery.culpritId,
      culpritName: culprit?.name ?? 'Unknown',
      solution: mystery.solution,
      solutionSteps: mystery.solutionSteps,
      rank,
    },
    stats,
  };
}

/** Builds the full verdict for a player who already accused today. */
export async function verdictForResult(
  userId: string,
  date: string,
  result: DayResult,
  mystery: Mystery
): Promise<TodayVerdict> {
  const culprit = mystery.suspects.find((s) => s.id === mystery.culpritId);
  const rank = await getRank(date, userId);
  return {
    correct: result.correct,
    points: result.points,
    culpritId: mystery.culpritId,
    culpritName: culprit?.name ?? 'Unknown',
    solution: mystery.solution,
    solutionSteps: mystery.solutionSteps,
    rank,
  };
}
