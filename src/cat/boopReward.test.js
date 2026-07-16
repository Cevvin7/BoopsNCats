import { describe, it, expect } from 'vitest';
import { BOOP_REWARD_AMOUNT, canClaimBoopReward } from './boopReward.js';

function local(y, m, d, h = 0, mi = 0) {
  return new Date(y, m - 1, d, h, mi, 0, 0).getTime();
}

describe('canClaimBoopReward', () => {
  it('is claimable when it has never been claimed', () => {
    expect(canClaimBoopReward(null, local(2024, 1, 10, 9, 0))).toBe(true);
  });

  it('is not claimable again the same local day before noon resets it', () => {
    const claimedAt = local(2024, 1, 10, 9, 0);
    expect(canClaimBoopReward(claimedAt, local(2024, 1, 10, 11, 0))).toBe(false);
  });

  it('becomes claimable again once local noon has passed', () => {
    const claimedAt = local(2024, 1, 10, 9, 0);
    expect(canClaimBoopReward(claimedAt, local(2024, 1, 10, 13, 0))).toBe(true);
  });

  it('stays claimable across multiple elapsed days', () => {
    const claimedAt = local(2024, 1, 10, 13, 0);
    expect(canClaimBoopReward(claimedAt, local(2024, 1, 12, 13, 0))).toBe(true);
  });
});

describe('BOOP_REWARD_AMOUNT', () => {
  it('is a positive number', () => {
    expect(BOOP_REWARD_AMOUNT).toBeGreaterThan(0);
  });
});
