import test from 'node:test';
import assert from 'node:assert/strict';
import { MYSTERIES } from '../src/server/data/mysteries.ts';

// Structural integrity checks for the mystery bank. These verify shape and
// internal consistency; fairness (solvability, unique culprit) is reviewed
// by hand in code review, not by tests.

test('bank has 14 mysteries with unique ids and numbers', () => {
  assert.equal(MYSTERIES.length, 14);
  assert.equal(new Set(MYSTERIES.map((m) => m.id)).size, 14);
  assert.equal(new Set(MYSTERIES.map((m) => m.number)).size, 14);
});

test('every mystery has a valid, solvable-looking structure', () => {
  for (const mystery of MYSTERIES) {
    assert.ok(mystery.title.length > 0, `${mystery.id}: title`);
    assert.ok(mystery.setting.length > 0, `${mystery.id}: setting`);
    assert.ok([1, 2, 3].includes(mystery.difficulty), `${mystery.id}: difficulty`);
    assert.ok(mystery.op.title.length > 0, `${mystery.id}: op title`);
    assert.ok(mystery.op.body.length > 20, `${mystery.id}: op body`);
    assert.ok(
      mystery.comments.length >= 4 && mystery.comments.length <= 8,
      `${mystery.id}: comments count ${mystery.comments.length}`
    );
    assert.equal(
      new Set(mystery.comments.map((c) => c.id)).size,
      mystery.comments.length,
      `${mystery.id}: duplicate comment ids`
    );
    for (const comment of mystery.comments) {
      assert.ok(comment.text.length > 0, `${mystery.id}: empty comment`);
      assert.ok(comment.author.startsWith('u/'), `${mystery.id}: author handle ${comment.author}`);
    }
    assert.ok(
      mystery.suspects.length >= 3 && mystery.suspects.length <= 4,
      `${mystery.id}: suspects count ${mystery.suspects.length}`
    );
    assert.equal(
      new Set(mystery.suspects.map((s) => s.id)).size,
      mystery.suspects.length,
      `${mystery.id}: duplicate suspect ids`
    );
    const culprit = mystery.suspects.find((s) => s.id === mystery.culpritId);
    assert.ok(culprit, `${mystery.id}: culpritId must be one of the suspects`);
    assert.ok(mystery.solution.length > 40, `${mystery.id}: solution too short`);
    assert.ok(mystery.solutionSteps.length >= 2, `${mystery.id}: solution steps`);
  }
});

test('difficulty spread covers easy, medium and hard', () => {
  const counts = { 1: 0, 2: 0, 3: 0 };
  for (const mystery of MYSTERIES) {
    counts[mystery.difficulty] += 1;
  }
  assert.ok(counts[1] >= 3, `easy cases: ${counts[1]}`);
  assert.ok(counts[2] >= 3, `medium cases: ${counts[2]}`);
  assert.ok(counts[3] >= 2, `hard cases: ${counts[3]}`);
});
