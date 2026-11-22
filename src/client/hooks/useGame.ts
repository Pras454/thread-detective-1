import { useCallback, useEffect, useState } from 'react';
import { showShareSheet, showToast } from '@devvit/web/client';
import type {
  AccuseResponse,
  InitResponse,
  TodayVerdict,
} from '../../shared/api';
import type { LeaderboardEntry, PlayerStats } from '../../shared/types';

/** Everything the result screen needs, from either init or accuse. */
export type VerdictView = {
  correct: boolean;
  points: number;
  culpritId: string;
  culpritName: string;
  solution: string;
  solutionSteps: string[];
  rank: number | null;
  stats: PlayerStats;
  leaderboard: LeaderboardEntry[];
};

function verdictFromToday(
  today: TodayVerdict,
  stats: PlayerStats,
  leaderboard: LeaderboardEntry[]
): VerdictView {
  return {
    correct: today.correct,
    points: today.points,
    culpritId: today.culpritId,
    culpritName: today.culpritName,
    solution: today.solution,
    solutionSteps: today.solutionSteps,
    rank: today.rank,
    stats,
    leaderboard,
  };
}

function verdictFromAccuse(response: AccuseResponse): VerdictView {
  return {
    correct: response.correct,
    points: response.points,
    culpritId: response.culpritId,
    culpritName: response.culpritName,
    solution: response.solution,
    solutionSteps: response.solutionSteps,
    rank: response.rank,
    stats: response.stats,
    leaderboard: response.leaderboard,
  };
}

const LOAD_ERROR = 'Could not open the case file. Check your connection and try again.';

/** Fetches and validates today's init payload. No state changes here. */
const fetchInit = async (): Promise<InitResponse> => {
  const res = await fetch('/api/init');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: InitResponse = await res.json();
  if (data.type !== 'init') throw new Error('Unexpected response');
  return data;
};

export const useGame = () => {
  const [init, setInit] = useState<InitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [accusing, setAccusing] = useState(false);
  const [verdict, setVerdict] = useState<VerdictView | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const applyInit = useCallback((data: InitResponse) => {
    setError(null);
    setInit(data);
    setStats(data.stats);
    setLeaderboard(data.leaderboard);
    if (data.todayVerdict) {
      setVerdict(
        verdictFromToday(data.todayVerdict, data.stats, data.leaderboard)
      );
    }
  }, []);

  const load = useCallback(async () => {
    try {
      applyInit(await fetchInit());
    } catch (err) {
      console.error('Failed to load today’s case', err);
      setError(LOAD_ERROR);
    }
  }, [applyInit]);

  // Initial load: state updates happen in promise callbacks, never
  // synchronously inside the effect.
  useEffect(() => {
    let cancelled = false;
    fetchInit()
      .then((data) => {
        if (!cancelled) applyInit(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load today’s case', err);
        setError(LOAD_ERROR);
      });
    return () => {
      cancelled = true;
    };
  }, [applyInit]);

  const select = useCallback(
    (suspectId: string) => {
      if (verdict) return;
      setSelected((prev) => (prev === suspectId ? null : suspectId));
    },
    [verdict]
  );

  const accuse = useCallback(async () => {
    if (!selected || accusing || verdict) return;
    setAccusing(true);
    try {
      const res = await fetch('/api/accuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspectId: selected }),
      });
      if (!res.ok) {
        if (res.status === 409) {
          showToast('You already accused someone today — reloading your result.');
          await load();
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data: AccuseResponse = await res.json();
      if (data.type !== 'accuse') throw new Error('Unexpected response');
      setVerdict(verdictFromAccuse(data));
      setStats(data.stats);
      setLeaderboard(data.leaderboard);
      setSelected(null);
    } catch (err) {
      console.error('Failed to accuse', err);
      showToast('Accusation failed. Please try again.');
    } finally {
      setAccusing(false);
    }
  }, [selected, accusing, verdict, load]);

  const shareResult = useCallback(async () => {
    if (!init || !verdict) return;
    const lines = [
      `Thread Detective — Case #${init.case.number}: ${init.case.title}`,
      verdict.correct
        ? `I solved it! ${verdict.points} points.`
        : `Wrong accusation — the culprit was ${verdict.culpritName}.`,
      `Streak: ${verdict.stats.streak} days. Can you crack today's case?`,
    ];
    try {
      await showShareSheet({
        title: 'Thread Detective',
        text: lines.join('\n'),
      });
    } catch (err) {
      console.error('Share failed', err);
      showToast('Sharing is not available right now.');
    }
  }, [init, verdict]);

  return {
    init,
    error,
    loading: init === null && error === null,
    selected,
    accusing,
    verdict,
    stats,
    leaderboard,
    select,
    accuse,
    shareResult,
    reload: load,
  } as const;
};
