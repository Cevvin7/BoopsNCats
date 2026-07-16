import { countNoonsCrossed } from './happinessModel.js';

export const BOOP_REWARD_AMOUNT = 100;

/**
 * The tap-the-cat reward is available once per local calendar day, reset
 * at local noon -- the same fixed daily checkpoint happinessModel.js uses
 * for decay, reused here rather than a second "24 hours since last claim"
 * scheme, so the two daily resets always land on the same real-world
 * moment. `lastClaimMs` is null before the reward has ever been claimed.
 */
export function canClaimBoopReward(lastClaimMs, nowMs = Date.now()) {
  if (lastClaimMs == null) return true;
  return countNoonsCrossed(lastClaimMs, nowMs) > 0;
}
