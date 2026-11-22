import type {
  CaseView,
  LeaderboardEntry,
  PlayerStats,
  Suspect,
} from '../shared/types';
import type { VerdictView } from './hooks/useGame';

export const StatChips = ({ stats }: { stats: PlayerStats }) => (
  <div className="flex gap-2">
    <span className="rounded-full border border-ink/20 bg-card px-3 py-1 text-xs font-semibold tracking-wide text-ink dark:border-white/20 dark:bg-night-card dark:text-paper">
      STREAK {stats.streak}
    </span>
    <span className="rounded-full border border-ink/20 bg-card px-3 py-1 text-xs font-semibold tracking-wide text-ink dark:border-white/20 dark:bg-night-card dark:text-paper">
      SOLVED {stats.solved}/{stats.played}
    </span>
    <span className="rounded-full border border-ink/20 bg-card px-3 py-1 text-xs font-semibold tracking-wide text-ink dark:border-white/20 dark:bg-night-card dark:text-paper">
      {stats.totalPoints} PTS
    </span>
  </div>
);

export const HowToPlay = () => (
  <details className="group rounded-lg border border-ink/15 bg-card px-4 py-3 text-sm text-ink-soft dark:border-white/15 dark:bg-night-card dark:text-paper/80">
    <summary className="cursor-pointer list-none font-semibold text-ink dark:text-paper">
      How to play
      <span className="float-right text-ink-faint transition-transform group-open:rotate-180">
        ▾
      </span>
    </summary>
    <ol className="mt-2 list-decimal space-y-1 pl-5">
      <li>Read the thread: the post and every comment hold clues.</li>
      <li>Spot the contradiction — one suspect&apos;s story cannot be true.</li>
      <li>Accuse the culprit. One accusation per day, so make it count.</li>
    </ol>
    <p className="mt-2 text-xs text-ink-faint dark:text-paper/50">
      Solve fast for a speed bonus, and come back tomorrow to keep your streak
      alive. A new case arrives every day at midnight UTC.
    </p>
  </details>
);

export const ThreadView = ({ caseData }: { caseData: CaseView }) => (
  <div className="space-y-3">
    {/* The original post, styled as the case report. */}
    <article className="case-file relative rounded-md bg-card p-4 pt-5 dark:bg-night-card">
      <p className="text-[11px] font-bold tracking-widest text-brass uppercase">
        {caseData.op.community} · posted by {caseData.op.author}
      </p>
      <h2 className="font-display mt-1 text-lg leading-snug font-bold text-ink dark:text-paper">
        {caseData.op.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-paper/80">
        {caseData.op.body}
      </p>
    </article>

    {/* The comments: evidence pinned to the board. */}
    <p className="pt-1 text-[11px] font-bold tracking-widest text-ink-faint uppercase">
      Evidence · {caseData.comments.length} comments
    </p>
    <div className="space-y-2">
      {caseData.comments.map((comment) => (
        <article
          key={comment.id}
          className="rounded-md border-l-2 border-evidence bg-card px-4 py-3 shadow-sm dark:bg-night-card"
        >
          <p className="text-xs font-semibold text-ink dark:text-paper">
            {comment.author}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft dark:text-paper/80">
            {comment.text}
          </p>
        </article>
      ))}
    </div>
  </div>
);

const initials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const SuspectGrid = ({
  suspects,
  selected,
  disabled,
  onSelect,
}: {
  suspects: Suspect[];
  selected: string | null;
  disabled: boolean;
  onSelect: (id: string) => void;
}) => (
  <div id="suspects" className="scroll-mt-4">
    <p className="text-[11px] font-bold tracking-widest text-ink-faint uppercase">
      Suspects · tap one, then accuse
    </p>
    <div className="mt-2 grid grid-cols-2 gap-2">
      {suspects.map((suspect) => {
        const isSelected = selected === suspect.id;
        return (
          <button
            key={suspect.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(suspect.id)}
            aria-pressed={isSelected}
            className={`rounded-md border-2 p-3 text-left transition-all ${
              isSelected
                ? 'border-evidence bg-evidence/5 shadow-md dark:bg-evidence/10'
                : 'border-ink/15 bg-card hover:border-brass dark:border-white/15 dark:bg-night-card'
            } ${disabled ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full font-display text-sm font-bold ${
                isSelected
                  ? 'bg-evidence text-white'
                  : 'bg-paper-deep text-ink dark:bg-white/10 dark:text-paper'
              }`}
            >
              {initials(suspect.name)}
            </span>
            <span className="mt-2 block text-sm font-bold text-ink dark:text-paper">
              {suspect.name}
            </span>
            <span className="block text-xs text-brass">{suspect.role}</span>
            <span className="mt-1 block text-xs leading-snug text-ink-soft dark:text-paper/70">
              {suspect.note}
            </span>
            {isSelected && (
              <span className="mt-2 inline-block rounded-full bg-evidence px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                Selected
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

export const Leaderboard = ({
  entries,
  compact,
}: {
  entries: LeaderboardEntry[];
  compact?: boolean;
}) => {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-ink-faint dark:text-paper/50">
        No scores yet today — be the first detective on the board.
      </p>
    );
  }
  const shown = compact ? entries.slice(0, 5) : entries;
  return (
    <ol className="divide-y divide-ink/10 dark:divide-white/10">
      {shown.map((entry) => (
        <li
          key={`${entry.rank}-${entry.username}`}
          className={`flex items-center gap-3 py-2 text-sm ${
            entry.isYou ? 'font-bold text-ink dark:text-paper' : 'text-ink-soft dark:text-paper/80'
          }`}
        >
          <span className="w-6 text-center font-display font-bold text-brass">
            {entry.rank}
          </span>
          <span className="flex-1 truncate">
            {entry.username}
            {entry.isYou ? ' (you)' : ''}
          </span>
          <span className="font-mono text-xs">{entry.points} pts</span>
        </li>
      ))}
    </ol>
  );
};

export const ResultCard = ({
  verdict,
  loggedIn,
  onShare,
  onDiscuss,
}: {
  verdict: VerdictView;
  loggedIn: boolean;
  onShare: () => void;
  onDiscuss: () => void;
}) => (
  <div className="space-y-4">
    <div
      className={`tape relative rounded-md border-2 p-4 pt-5 ${
        verdict.correct
          ? 'border-solved bg-solved/5 dark:bg-solved/10'
          : 'border-evidence bg-evidence/5 dark:bg-evidence/10'
      }`}
    >
      <p
        className={`font-display text-xl font-bold ${
          verdict.correct
            ? 'text-solved'
            : 'text-evidence'
        }`}
      >
        {verdict.correct ? 'Case solved!' : 'Wrong accusation'}
      </p>
      <p className="mt-1 text-sm text-ink-soft dark:text-paper/80">
        {verdict.correct
          ? `You named the culprit — ${verdict.culpritName}.`
          : `The culprit was ${verdict.culpritName}.`}
        {verdict.points > 0
          ? ` ${verdict.points} points${verdict.rank ? `, #${verdict.rank} on today's board` : ''}.`
          : ''}
      </p>
      {!loggedIn && (
        <p className="mt-2 text-xs text-ink-faint dark:text-paper/50">
          You played as a guest — log in to Reddit to save your streak and
          join the leaderboard.
        </p>
      )}
    </div>

    <div className="case-file rounded-md bg-card p-4 dark:bg-night-card">
      <p className="text-[11px] font-bold tracking-widest text-ink-faint uppercase">
        How the case was cracked
      </p>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-ink-soft dark:text-paper/80">
        {verdict.solutionSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="mt-3 border-t border-ink/10 pt-3 text-sm leading-relaxed text-ink dark:text-paper dark:border-white/10">
        {verdict.solution}
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onShare}
        className="cursor-pointer rounded-full bg-evidence px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-evidence-deep"
      >
        Share my result
      </button>
      <button
        type="button"
        onClick={onDiscuss}
        className="cursor-pointer rounded-full border border-ink/25 bg-card px-4 py-2 text-sm font-bold text-ink transition-colors hover:border-brass dark:border-white/25 dark:bg-night-card dark:text-paper"
      >
        Discuss in the comments
      </button>
    </div>

    <div>
      <p className="text-[11px] font-bold tracking-widest text-ink-faint uppercase">
        Today&apos;s leaderboard
      </p>
      <div className="mt-1 rounded-md border border-ink/10 bg-card px-4 py-2 dark:border-white/10 dark:bg-night-card">
        <Leaderboard entries={verdict.leaderboard} compact />
      </div>
      <p className="mt-3 text-center text-xs text-ink-faint dark:text-paper/50">
        A new case arrives tomorrow at midnight UTC. Come back to keep your
        streak alive.
      </p>
    </div>
  </div>
);
