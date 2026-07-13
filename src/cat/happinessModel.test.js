import { describe, it, expect } from 'vitest';
import {
  MAX_HAPPINESS,
  defaultCat,
  needsAttention,
  countNoonsCrossed,
  applyHappinessDecay,
  recordActivityUpload,
} from './happinessModel.js';

function local(y, m, d, h = 0, mi = 0) {
  return new Date(y, m - 1, d, h, mi, 0, 0).getTime();
}

describe('countNoonsCrossed', () => {
  it('is 0 when no time has passed', () => {
    const t = local(2024, 1, 10, 9, 0);
    expect(countNoonsCrossed(t, t)).toBe(0);
  });

  it('is 0 for a same-day span that never reaches noon', () => {
    expect(countNoonsCrossed(local(2024, 1, 10, 8, 0), local(2024, 1, 10, 11, 0))).toBe(0);
  });

  it('is 1 for a same-day span that crosses noon', () => {
    expect(countNoonsCrossed(local(2024, 1, 10, 9, 0), local(2024, 1, 10, 15, 0))).toBe(1);
  });

  it('is 1 across exactly one day, from just after noon to the next noon', () => {
    expect(countNoonsCrossed(local(2024, 1, 10, 13, 0), local(2024, 1, 11, 13, 0))).toBe(1);
  });

  it('is 2 across two days', () => {
    expect(countNoonsCrossed(local(2024, 1, 10, 13, 0), local(2024, 1, 12, 13, 0))).toBe(2);
  });

  it('caps at MAX_HAPPINESS for very long gaps', () => {
    expect(countNoonsCrossed(local(2024, 1, 1, 0, 0), local(2024, 6, 1, 0, 0))).toBe(MAX_HAPPINESS);
  });

  it('is 0 if "to" is before or equal to "from"', () => {
    const t = local(2024, 1, 10, 12, 0);
    expect(countNoonsCrossed(t, t - 1000)).toBe(0);
  });
});

describe('applyHappinessDecay', () => {
  it('returns the same object reference when no noon has passed', () => {
    const cat = { happiness: 7, lastActivityUpload: local(2024, 1, 10, 9, 0), lastDecayCheck: local(2024, 1, 10, 9, 0) };
    const result = applyHappinessDecay(cat, local(2024, 1, 10, 11, 0));
    expect(result).toBe(cat);
  });

  it('decrements happiness by one per elapsed noon and bumps lastDecayCheck', () => {
    const cat = { happiness: 7, lastActivityUpload: local(2024, 1, 10, 9, 0), lastDecayCheck: local(2024, 1, 10, 9, 0) };
    const now = local(2024, 1, 12, 9, 0); // two noons crossed (Jan 10 and Jan 11)
    const result = applyHappinessDecay(cat, now);
    expect(result.happiness).toBe(5);
    expect(result.lastDecayCheck).toBe(now);
  });

  it('floors happiness at 0 instead of going negative', () => {
    const cat = { happiness: 2, lastActivityUpload: local(2024, 1, 1, 9, 0), lastDecayCheck: local(2024, 1, 1, 9, 0) };
    const now = local(2024, 1, 10, 9, 0); // far more than 2 noons crossed
    expect(applyHappinessDecay(cat, now).happiness).toBe(0);
  });
});

describe('recordActivityUpload', () => {
  it('resets happiness to max and updates both timestamps', () => {
    const cat = { happiness: 0, lastActivityUpload: local(2024, 1, 1, 9, 0), lastDecayCheck: local(2024, 1, 5, 9, 0) };
    const now = local(2024, 1, 10, 9, 0);
    const result = recordActivityUpload(cat, now);
    expect(result.happiness).toBe(MAX_HAPPINESS);
    expect(result.lastActivityUpload).toBe(now);
    expect(result.lastDecayCheck).toBe(now);
  });
});

describe('needsAttention', () => {
  it('is true only when happiness is exactly 0', () => {
    expect(needsAttention({ happiness: 0 })).toBe(true);
    expect(needsAttention({ happiness: 1 })).toBe(false);
    expect(needsAttention({ happiness: 7 })).toBe(false);
  });
});

describe('defaultCat', () => {
  it('starts at max happiness with both timestamps set to now', () => {
    const now = local(2024, 1, 10, 9, 0);
    const cat = defaultCat(now);
    expect(cat.happiness).toBe(MAX_HAPPINESS);
    expect(cat.lastActivityUpload).toBe(now);
    expect(cat.lastDecayCheck).toBe(now);
  });
});
