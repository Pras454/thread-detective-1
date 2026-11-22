# Thread Detective — Devpost Submission Draft

Hackathon: Reddit Game of the Day 2026 (https://redditgameofday2026.devpost.com/)
Deadline: 9 Dec 2026 09:00 WIB. Target submit: 6–7 Dec (editable until deadline).
Status: SUBMITTED 23 Nov 2026 ~04:40 WIB. Project: https://devpost.com/software/thread-detective-zmd06l (submission ID 1316582). Editable until deadline 9 Dec 2026 09:00 WIB.

## Fields to paste into Devpost ("Start project")

### Project name
Thread Detective

### Tagline (short pitch)
A new whodunit every day, told as a Reddit thread. Read the post, spot the lie, name the culprit.

### App link (required)
https://developers.reddit.com/apps/thread-detective-1

### Demo post (required — public subreddit < 200 members)
The auto-created post in r/thread_detective__dev:
"Thread Detective — a new mystery every day"
https://www.reddit.com/r/thread_detective__dev/s/CrYygQC4Fd
(Link obtained by Bagus from the Reddit app, 23 Nov 2026 ~04:16 WIB.)

### Demo video (optional, < 1 min)
https://youtube.com/shorts/nETUBiggy0Y
(Recorded + uploaded by Bagus 23 Nov 2026 ~04:29 WIB: full Case #4
playthrough, ~30s, solved — Lena Ruiz, 149 pts.)

### Source code (optional, public repo)
TODO (Bagus): create empty public GitHub repo `thread-detective-1`,
Muse pushes ~/workspace/reddit-thread-detective/ (latest commit 192096d, v0.0.2).
Repo URL goes here once pushed.

---

## Description (paste into the project description)

### What it is
Thread Detective is a daily whodunit mystery game that plays out exactly
where Reddit users already live: inside a thread. Every day at midnight UTC
a new case appears — a fake subreddit post with a small mystery, plus 4–8
comments from suspects and witnesses. One of them is lying. Read the
thread, find the contradiction, and accuse one suspect. One accusation per
day. Solve fast for a speed bonus, keep your streak alive by coming back
tomorrow, and climb the daily leaderboard.

### How it plays
- Open the daily post and tap "Open the case file".
- Read the original post and the evidence comments — every clue you need
  is in the thread, and exactly one suspect's story contradicts the facts.
- Tap a suspect card, then accuse. The verdict screen walks through the
  full deduction step by step, so even a wrong guess teaches you the logic.
- Scoring: 100 points for a correct accusation plus up to 50 speed bonus
  points. Streaks, best streak, and a daily leaderboard persist across days.

### Why it fits Reddit
The mystery IS a Reddit thread — not a game skinned with Reddit logos.
Accusations, alibis, and contradictions all happen in the comment format
Redditors already argue in. The "Discuss in the comments" button sends
players back to the real post comments to debate the case after solving,
so the game feeds conversation instead of replacing it. Cases are
non-violent neighborhood mysteries (soaked scorecards, a borrowed mascot,
a sabotaged sourdough) — cozy, not grim.

### Daily content
14 hand-written cases ship at launch (5 easy, 6 medium, 3 hard), each
fairness-reviewed: every clue in-thread, exactly one culprit, one decisive
contradiction. The bank grows by appending cases — no code changes needed
to add a day.

### How it was built
Devvit Web: React 19 + Vite client (inline splash + expanded game view),
Hono server, Redis for streaks, stats, and the daily leaderboard.
Anti-cheat by design: culprit and solution live server-side only — the
client bundle contains no answers (grep-verified). No external links, no
free-form user content, no Reddit IP; data-minimal with TTLs.

### Live proof (playtested 22 Nov 2026)
Uploaded v0.0.2 (polish), installed to r/thread_detective__dev. First live solve:
147 pts (100 + 47 speed bonus), #1 on the day's leaderboard, streak saved.

---

## Remaining before submit (checklist)
- [x] Polish DONE 22 Nov (v0.0.2, commit 192096d): sticky accuse button
      scrolls to suspects when nothing is selected; scroll cue under the
      evidence; dates labeled (UTC). Installed + verified live.
- [x] Bagus: demo-post link copied 23 Nov ~04:16 WIB (see above).
- [x] Bagus: record + upload demo video < 1 min to YouTube (done 23 Nov ~04:29 WIB: https://youtube.com/shorts/nETUBiggy0Y).
- [ ] Bagus (optional): create public GitHub repo `thread-detective-1`,
      Muse pushes the code.
- [x] Devpost form filled + submitted by Muse via browser 23 Nov ~04:40 WIB (login via GitHub Pras454; source code left blank, repo pending).
- [ ] Do NOT publish the app on Reddit (event rules prefer waiting until
      after the hackathon).
