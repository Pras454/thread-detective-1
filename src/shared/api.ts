import type {
  CaseView,
  DayResult,
  LeaderboardEntry,
  PlayerStats,
} from './types';

export type ErrorResponse = {
  status: 'error';
  message: string;
};

export type TodayVerdict = {
  correct: boolean;
  points: number;
  culpritId: string;
  culpritName: string;
  solution: string;
  solutionSteps: string[];
  /** The player's rank on today's leaderboard, or null when not ranked. */
  rank: number | null;
};

export type InitResponse = {
  type: 'init';
  postId: string;
  /** UTC date key of today's case, 'YYYY-MM-DD'. */
  date: string;
  /** Today's case WITHOUT the answer. */
  case: CaseView;
  username: string | null;
  /** False for logged-out players: they can play, but nothing is saved. */
  loggedIn: boolean;
  stats: PlayerStats;
  /** The player's result for today, if they already accused. */
  todayResult: DayResult | null;
  /** Full verdict for today, only when the player already accused. */
  todayVerdict: TodayVerdict | null;
  leaderboard: LeaderboardEntry[];
};

export type AccuseRequest = {
  suspectId: string;
};

export type AccuseResponse = {
  type: 'accuse';
  correct: boolean;
  points: number;
  /** The culprit's suspect id (revealed only after accusing). */
  culpritId: string;
  culpritName: string;
  solution: string;
  solutionSteps: string[];
  stats: PlayerStats;
  leaderboard: LeaderboardEntry[];
  /** The player's rank on today's leaderboard, or null when logged out. */
  rank: number | null;
};

export type LeaderboardResponse = {
  type: 'leaderboard';
  date: string;
  entries: LeaderboardEntry[];
};
