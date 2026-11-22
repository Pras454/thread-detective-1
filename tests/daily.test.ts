import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE_POINTS,
  MAX_TIME_BONUS,
  dateKey,
  dayNumber,
  mysteryIndexForDate,
  previousDateKey,
  scoreForSolve,
  updateStreak,
} from '../src/shared/daily.ts';

test('dateKey formats a UTC date', () => {
  assert.equal(dateKey(new Date('2026-12-01T15:30:00.000Z')), '2026-12-01');
  assert.equal(dateKey(new Date('2026-01-05T00:00:00.000Z')), '2026-01-05');
});

test('dayNumber counts whole days since the epoch', () => {
  assert.equal(dayNumber('1970-01-01'), 0);
  assert.equal(dayNumber('1970-01-02'), 1);
  assert.equal(dayNumber('2026-12-02') - dayNumber('2026-12-01'), 1);
});

test('mysteryIndexForDate is deterministic and cycles through the bank', () => {
  assert.equal(mysteryIndexForDate('2026-12-01', 14), mysteryIndexForDate('2026-12-01', 14));
  const indices = new Set<number>();
  for (let day = 1; day <= 14; day++) {
    const date = `2026-12-${String(day).padStart(2, '0')}`;
    indices.add(mysteryIndexForDate(date, 14));
  }
  // 14 consecutive days cover all 14 slots exactly once.
  assert.equal(indices.size, 14);
  assert.equal(mysteryIndexForDate('2026-12-15', 14), mysteryIndexForDate('2026-12-01', 14));
  assert.equal(mysteryIndexForDate('2026-12-01', 0), 0);
});

test('previousDateKey steps back one day across month and year boundaries', () => {
  assert.equal(previousDateKey('2026-12-01'), '2026-11-30');
  assert.equal(previousDateKey('2026-01-01'), '2025-12-31');
  assert.equal(previousDateKey('2026-03-01'), '2026-02-28');
});

test('scoreForSolve: wrong is zero, correct is 100 plus a decaying speed bonus', () => {
  assert.equal(scoreForSolve(false, 0), 0);
  assert.equal(scoreForSolve(false, 3600), 0);
  assert.equal(scoreForSolve(true, 0), BASE_POINTS + MAX_TIME_BONUS);
  assert.equal(scoreForSolve(true, 59), BASE_POINTS + MAX_TIME_BONUS);
  assert.equal(scoreForSolve(true, 60), BASE_POINTS + MAX_TIME_BONUS - 1);
  assert.equal(scoreForSolve(true, 50 * 60), BASE_POINTS);
  assert.equal(scoreForSolve(true, 5 * 3600), BASE_POINTS);
  assert.equal(scoreForSolve(true, -30), BASE_POINTS + MAX_TIME_BONUS);
});

test('updateStreak continues only on consecutive solved days', () => {
  // Solved yesterday -> streak grows.
  assert.deepEqual(
    updateStreak({ streak: 3, bestStreak: 5, lastSolvedDate: '2026-12-01' }, '2026-12-02', true),
    { streak: 4, bestStreak: 5 }
  );
  // Solved yesterday and beats the best -> best grows too.
  assert.deepEqual(
    updateStreak({ streak: 5, bestStreak: 5, lastSolvedDate: '2026-12-01' }, '2026-12-02', true),
    { streak: 6, bestStreak: 6 }
  );
  // Gap since the last solve -> restart at 1.
  assert.deepEqual(
    updateStreak({ streak: 4, bestStreak: 9, lastSolvedDate: '2026-11-28' }, '2026-12-02', true),
    { streak: 1, bestStreak: 9 }
  );
  // First ever solve.
  assert.deepEqual(
    updateStreak({ streak: 0, bestStreak: 0, lastSolvedDate: null }, '2026-12-02', true),
    { streak: 1, bestStreak: 1 }
  );
  // Wrong accusation spends the day: streak resets, best is kept.
  assert.deepEqual(
    updateStreak({ streak: 4, bestStreak: 9, lastSolvedDate: '2026-12-01' }, '2026-12-02', false),
    { streak: 0, bestStreak: 9 }
  );
});
