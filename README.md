# Thread Detective

**A daily whodunit game that lives inside a Reddit post.** Every day, a new
mystery is published as a fictional thread: an original post reporting a small
mishap (a missing trophy, a salted sourdough starter, a repainted park bench),
plus a handful of comments from the people involved. Hidden in those comments
are the clues — alibis, contradictions, and one detail only the culprit could
know. Read the thread, spot the lie, and accuse the culprit.

Thread Detective is a **logic puzzle, not a storytelling app**: every case has
exactly one correct answer, every fact needed to solve it is inside the thread,
and the solution explains the full chain of deduction. All cases are
light-hearted and non-violent, and every character, place, and community in
them is fictional.

## Who is it for?

Anyone who likes a two-minute brain teaser with their morning scroll. No
account setup, no downloads, no purchases — open the post, read the case, make
your accusation. Players who are logged in to Reddit keep a daily streak and a
place on the day's leaderboard; guests can play the case too, but their
results are not saved.

## How to play

1. **Open the case file.** Tap the post to open today's mystery.
2. **Read the thread.** The post describes what happened; the comments hold
   the clues. Pay attention to times, places, and who knew what.
3. **Pick a suspect.** Tap one of the suspect cards. You can change your mind
   until you accuse.
4. **Accuse.** You get **one accusation per day**, so choose carefully.
5. **See the verdict.** The app reveals whether you were right, who the
   culprit was, and the step-by-step deduction — then shows your streak, your
   points, and today's leaderboard.

### Scoring

- A correct accusation is worth **100 points**, plus a **speed bonus of up to
  50 points** (one point lost per minute after you first open the case, down
  to zero bonus).
- A wrong accusation scores **0 points**.
- **Streaks** count consecutive days you solved the case. Solve today to keep
  your streak alive; miss a day — or accuse the wrong person — and it resets
  to zero. Your best streak is remembered.
- The **daily leaderboard** ranks today's players by points. A new case, and
  a new leaderboard, arrive every day at midnight UTC.

### After you play

From the result card you can **share your result** (using Reddit's native
share sheet) or jump to **the post's comments** to discuss theories with other
players. Sharing and commenting are always your choice — they are never
required to play, and the app never posts or comments on your behalf.

## For moderators

Install Thread Detective in your subreddit and use the subreddit menu item
**"Create a Thread Detective post"** to publish the game as a post. One post
serves the whole community: the case inside it changes automatically every day
at midnight UTC, so there is nothing to update by hand. Players' streaks and
scores are stored per subreddit installation.

## Privacy

Thread Detective stores only what the game needs, in Reddit's own Redis
storage for this app installation:

- your Reddit user ID (to attach your streak and scores to you),
- your username (to show it on the leaderboard),
- your daily results, streak, and points.

It never asks for passwords, email addresses, or any other personal
information, never tracks you outside the game, and never shares your data
with anyone. Daily records delete themselves automatically after 30 days, and
player stats after 90 days without play. There is no advertising, no
in-app purchase, and no link out to any external site or service.

## How the game is built (for developers)

- **Stack:** React 19 + Tailwind CSS 4 + Vite (client), Hono on Node
  (server), Redis (storage), all on Devvit Web (`@devvit/web` 0.15.4).
  Node 24+ is required.
- **Structure:**
  - `src/client/` — the game UI (`game.tsx`) and the inline splash screen
    (`splash.tsx`) shown in the feed.
  - `src/server/` — the API (`routes/api.ts`), the game logic and Redis
    access (`core/game.ts`), and the mystery bank (`data/mysteries.ts`).
  - `src/shared/` — types and the pure daily-game logic (`daily.ts`:
    date-to-case selection, scoring, streak rules).
  - `tests/` — unit tests for the daily logic and the mystery bank.
- **Anti-cheat design:** the full mystery — culprit and solution — lives only
  on the server. The client receives a `CaseView` with the answer stripped
  out; the verdict is computed server-side when you accuse.
- **Daily rotation:** the case for a date is picked deterministically from
  the bank (`dayNumber mod bankSize`), so every player sees the same case on
  the same UTC day. The bank currently holds 14 cases and is designed to grow
  to 30–60 by appending entries to `src/server/data/mysteries.ts` — no code
  changes needed.

## Commands

- `npm install` — install dependencies
- `npm run dev` — playtest on Reddit (creates a test subreddit; requires
  `devvit login`)
- `npm run build` — build the client and server bundles
- `npm run test:types` — type-check the whole project
- `npm run test:unit` — run the unit tests
- `npm run lint` — lint the project
- `npm run deploy` — type-check, lint, and upload a private version
  (do **not** publish during the hackathon — upload + playtest only)

## License

BSD-3-Clause (see `LICENSE`).
