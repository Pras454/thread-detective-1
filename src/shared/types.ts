// Shared types for Thread Detective.
// NOTE: The full Mystery (with culprit + solution) lives ONLY on the server.
// The client only ever receives a CaseView, which strips the answer.

export type Suspect = {
  /** Stable id within the mystery, e.g. 'mara'. */
  id: string;
  /** Display name, e.g. 'Mara Voss'. */
  name: string;
  /** One-line role, e.g. 'Night-shift barista'. */
  role: string;
  /** One-line flavor note shown on the suspect card. Must NOT leak the answer. */
  note: string;
};

export type ThreadComment = {
  id: string;
  /** Fictional handle, e.g. 'u/porchlight_pete'. Never a real redditor. */
  author: string;
  /** The comment text. Clues, alibis and contradictions live here. */
  text: string;
};

export type Mystery = {
  /** Stable id, e.g. 'case-01'. */
  id: string;
  /** Case number shown to players, e.g. 1. */
  number: number;
  /** Case title, e.g. 'The Case of the Vanishing Trophy'. */
  title: string;
  /** One-line scene setter shown above the thread. */
  setting: string;
  /** 1 = gentle, 2 = tricky, 3 = hard. */
  difficulty: 1 | 2 | 3;
  op: {
    author: string;
    /** Fictional community name, e.g. 'Maple Street'. No 'r/' prefix needed. */
    community: string;
    title: string;
    body: string;
  };
  /** 4-8 comments carrying the clues. */
  comments: ThreadComment[];
  /** 3-4 suspects. */
  suspects: Suspect[];
  /** id of the one culprit. SERVER ONLY — never sent to the client. */
  culpritId: string;
  /** The full deduction, 2-5 sentences. SERVER ONLY. */
  solution: string;
  /** Short bullet chain of the key deductions. SERVER ONLY. */
  solutionSteps: string[];
};

/** What the client is allowed to see: the case without the answer. */
export type CaseView = Omit<Mystery, 'culpritId' | 'solution' | 'solutionSteps'>;

export type DayResult = {
  date: string;
  suspectId: string;
  correct: boolean;
  points: number;
  /** Unix seconds when the accusation was made. */
  at: number;
};

export type PlayerStats = {
  streak: number;
  bestStreak: number;
  played: number;
  solved: number;
  totalPoints: number;
  lastSolvedDate: string | null;
  lastPlayedDate: string | null;
};

export type LeaderboardEntry = {
  rank: number;
  username: string;
  points: number;
  /** True when this row is the requesting player. */
  isYou: boolean;
};
