import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { context, navigateTo, showLoginPrompt } from '@devvit/web/client';
import { useGame } from './hooks/useGame';
import {
  HowToPlay,
  Leaderboard,
  ResultCard,
  StatChips,
  SuspectGrid,
  ThreadView,
} from './components';

const difficultyLabel = (difficulty: 1 | 2 | 3): string =>
  difficulty === 1 ? 'Gentle' : difficulty === 2 ? 'Tricky' : 'Hard';

const formatDate = (dateStr: string): string => {
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

export const App = () => {
  const {
    init,
    error,
    loading,
    selected,
    accusing,
    verdict,
    stats,
    leaderboard,
    select,
    accuse,
    shareResult,
    reload,
  } = useGame();

  const discuss = () => {
    const { postId, subredditName } = context;
    if (postId && subredditName) {
      navigateTo(`https://reddit.com/r/${subredditName}/comments/${postId}`);
    } else if (subredditName) {
      navigateTo(`https://reddit.com/r/${subredditName}`);
    }
  };

  // The suspect cards sit below the evidence, off-screen on first view. If
  // the player taps the sticky button before choosing, scroll them to the
  // suspects instead of leaving a dead disabled button.
  const handleAccuseClick = () => {
    if (accusing) return;
    if (selected) {
      void accuse();
      return;
    }
    document
      .getElementById('suspects')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-paper text-ink dark:bg-night-deep dark:text-paper">
      <div className="mx-auto max-w-[560px] px-4 py-4">
        {/* Masthead */}
        <header className="border-b-2 border-ink/80 pb-3 dark:border-paper/70">
          <div className="flex items-baseline justify-between gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Thread Detective
            </h1>
            {init && (
              <span className="shrink-0 rounded-sm bg-evidence px-2 py-0.5 text-[11px] font-bold tracking-wider text-white uppercase">
                Case #{init.case.number} · {difficultyLabel(init.case.difficulty)}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-soft dark:text-paper/70">
            {init
              ? `${formatDate(init.date)} (UTC) · One mystery a day. Read the thread, spot the lie, name the culprit.`
              : 'One mystery a day. Read the thread, spot the lie, name the culprit.'}
          </p>
          {stats && (
            <div className="mt-3">
              <StatChips stats={stats} />
            </div>
          )}
        </header>

        {loading && (
          <p className="animate-pulse py-16 text-center font-display text-lg text-ink-soft dark:text-paper/70">
            Opening the case file…
          </p>
        )}

        {error && (
          <div className="py-16 text-center">
            <p className="text-sm text-ink-soft dark:text-paper/70">{error}</p>
            <button
              type="button"
              onClick={() => void reload()}
              className="mt-4 cursor-pointer rounded-full bg-evidence px-4 py-2 text-sm font-bold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {init && !verdict && (
          <main className="space-y-4 pt-4">
            <HowToPlay />
            {!init.loggedIn && (
              <div className="rounded-md border border-brass/60 bg-brass/10 px-4 py-3 text-sm text-ink-soft dark:text-paper/80">
                You are playing as a guest — your streak and leaderboard spot
                will not be saved.{' '}
                <button
                  type="button"
                  onClick={() => showLoginPrompt()}
                  className="cursor-pointer font-bold text-evidence underline"
                >
                  Log in to Reddit
                </button>{' '}
                to keep them.
              </div>
            )}
            <p className="font-display text-base text-ink-soft italic dark:text-paper/70">
              {init.case.setting}
            </p>
            <ThreadView caseData={init.case} />
            {!selected && (
              <p className="text-center text-sm font-semibold text-evidence">
                ↓ Scroll down to pick your suspect
              </p>
            )}
            <SuspectGrid
              suspects={init.case.suspects}
              selected={selected}
              disabled={accusing}
              onSelect={select}
            />
            <div className="sticky bottom-0 -mx-4 border-t border-ink/15 bg-paper/95 px-4 py-3 backdrop-blur dark:border-white/15 dark:bg-night-deep/95">
              <button
                type="button"
                disabled={accusing}
                onClick={handleAccuseClick}
                className="w-full cursor-pointer rounded-full bg-evidence py-3 text-base font-bold text-white transition-colors hover:bg-evidence-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                {accusing
                  ? 'Checking the evidence…'
                  : selected
                    ? `Accuse ${init.case.suspects.find((s) => s.id === selected)?.name ?? 'suspect'}`
                    : 'Pick a suspect below ↓'}
              </button>
              <p className="mt-2 text-center text-xs text-ink-faint dark:text-paper/50">
                One accusation per day. Choose carefully.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-widest text-ink-faint uppercase">
                Today&apos;s leaderboard
              </p>
              <div className="mt-1 rounded-md border border-ink/10 bg-card px-4 py-2 dark:border-white/10 dark:bg-night-card">
                <Leaderboard entries={leaderboard} compact />
              </div>
            </div>
          </main>
        )}

        {init && verdict && (
          <main className="pt-4">
            <ResultCard
              verdict={verdict}
              loggedIn={init.loggedIn}
              onShare={() => void shareResult()}
              onDiscuss={discuss}
            />
          </main>
        )}
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
