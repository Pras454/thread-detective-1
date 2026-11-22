import './index.css';

import { requestExpandedMode } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const todayLabel = (): string =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

export const Splash = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 py-8 text-center text-ink dark:bg-night-deep dark:text-paper">
    <p className="text-[11px] font-bold tracking-[0.25em] text-brass uppercase">
      {todayLabel()} (UTC) · Daily mystery
    </p>
    <h1 className="font-display text-3xl leading-tight font-bold">
      Thread Detective
    </h1>
    <p className="max-w-[320px] text-sm leading-relaxed text-ink-soft dark:text-paper/75">
      A new whodunit every day, told as a thread. Read the post, read the
      comments, spot the lie — and name the culprit.
    </p>
    <div className="case-file w-full max-w-[320px] rounded-md bg-card p-4 text-left dark:bg-night-card">
      <p className="text-[11px] font-bold tracking-widest text-ink-faint uppercase">
        Today&apos;s case file
      </p>
      <p className="font-display mt-1 text-base font-bold">
        One thread. Three suspects. One liar.
      </p>
      <p className="mt-1 text-xs text-ink-soft dark:text-paper/70">
        One accusation per day · Solve fast for a speed bonus · Streaks reset
        if you miss a day
      </p>
    </div>
    <button
      type="button"
      className="cursor-pointer rounded-full bg-evidence px-6 py-3 text-base font-bold text-white transition-colors hover:bg-evidence-deep"
      onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
    >
      Open the case file
    </button>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
