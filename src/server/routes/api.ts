import { Hono } from 'hono';
import { context } from '@devvit/web/server';
import { scoreForSolve } from '../../shared/daily';
import type {
  AccuseRequest,
  AccuseResponse,
  ErrorResponse,
  InitResponse,
  LeaderboardResponse,
} from '../../shared/api';
import {
  emptyStats,
  getLeaderboard,
  getStats,
  getTodayResult,
  mysteryForDate,
  recordAccusation,
  recordFirstSeen,
  saveUsername,
  toCaseView,
  todayKey,
  verdictForResult,
} from '../core/game';

export const api = new Hono();

const errorResponse = (message: string): ErrorResponse => ({
  status: 'error',
  message,
});

api.get('/init', async (c) => {
  const { postId, userId, username } = context;

  if (!postId) {
    console.error('API Init Error: postId not found in devvit context');
    return c.json(errorResponse('postId is required but missing from context'), 400);
  }

  try {
    const date = todayKey();
    const mystery = mysteryForDate(date);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const loggedIn = userId !== undefined;

    const [stats, todayResult, leaderboard] = await Promise.all([
      userId ? getStats(userId) : Promise.resolve(emptyStats()),
      userId ? getTodayResult(userId, date) : Promise.resolve(null),
      getLeaderboard(date, userId),
    ]);

    if (userId) {
      // Best-effort bookkeeping; a failure here must not block playing.
      await recordFirstSeen(userId, date, nowSeconds).catch((err) => {
        console.error('recordFirstSeen failed:', err);
      });
      if (username) {
        await saveUsername(userId, username).catch((err) => {
          console.error('saveUsername failed:', err);
        });
      }
    }

    const todayVerdict =
      userId && todayResult
        ? await verdictForResult(userId, date, todayResult, mystery)
        : null;

    return c.json<InitResponse>({
      type: 'init',
      postId,
      date,
      case: toCaseView(mystery),
      username: username ?? null,
      loggedIn,
      stats,
      todayResult,
      todayVerdict,
      leaderboard,
    });
  } catch (error) {
    console.error(`API Init Error for post ${postId}:`, error);
    const message =
      error instanceof Error ? `Initialization failed: ${error.message}` : 'Unknown error during initialization';
    return c.json(errorResponse(message), 400);
  }
});

api.post('/accuse', async (c) => {
  const { postId, userId, username } = context;

  if (!postId) {
    return c.json(errorResponse('postId is required'), 400);
  }

  let body: AccuseRequest;
  try {
    body = await c.req.json<AccuseRequest>();
  } catch {
    return c.json(errorResponse('Invalid request body'), 400);
  }

  const date = todayKey();
  const mystery = mysteryForDate(date);
  const suspect = mystery.suspects.find((s) => s.id === body.suspectId);
  if (!suspect) {
    return c.json(errorResponse('Unknown suspect'), 400);
  }

  const nowSeconds = Math.floor(Date.now() / 1000);

  // Logged-out players can still play and get a verdict; nothing is saved.
  if (!userId) {
    const correct = body.suspectId === mystery.culpritId;
    const culprit = mystery.suspects.find((s) => s.id === mystery.culpritId);
    return c.json<AccuseResponse>({
      type: 'accuse',
      correct,
      points: scoreForSolve(correct, 0),
      culpritId: mystery.culpritId,
      culpritName: culprit?.name ?? 'Unknown',
      solution: mystery.solution,
      solutionSteps: mystery.solutionSteps,
      stats: emptyStats(),
      leaderboard: await getLeaderboard(date, undefined),
      rank: null,
    });
  }

  try {
    const outcome = await recordAccusation(
      userId,
      username ?? null,
      date,
      body.suspectId,
      mystery,
      nowSeconds
    );
    if (!outcome) {
      return c.json(errorResponse('You already accused someone today'), 409);
    }

    return c.json<AccuseResponse>({
      type: 'accuse',
      correct: outcome.verdict.correct,
      points: outcome.verdict.points,
      culpritId: outcome.verdict.culpritId,
      culpritName: outcome.verdict.culpritName,
      solution: outcome.verdict.solution,
      solutionSteps: outcome.verdict.solutionSteps,
      stats: outcome.stats,
      leaderboard: await getLeaderboard(date, userId),
      rank: outcome.verdict.rank,
    });
  } catch (error) {
    console.error(`API Accuse Error for post ${postId}:`, error);
    const message =
      error instanceof Error ? `Accusation failed: ${error.message}` : 'Unknown error during accusation';
    return c.json(errorResponse(message), 400);
  }
});

api.get('/leaderboard', async (c) => {
  const { postId, userId } = context;

  if (!postId) {
    return c.json(errorResponse('postId is required'), 400);
  }

  try {
    const date = todayKey();
    return c.json<LeaderboardResponse>({
      type: 'leaderboard',
      date,
      entries: await getLeaderboard(date, userId),
    });
  } catch (error) {
    console.error(`API Leaderboard Error for post ${postId}:`, error);
    return c.json(errorResponse('Failed to load leaderboard'), 400);
  }
});
