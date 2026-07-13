export const CatHealth = Object.freeze({
  HEALTHY: 'healthy',
  NEEDS_ATTENTION: 'needsAttention',
  SICK: 'sick',
});

// Tune these to change pacing. No permadeath: no matter how long it's been,
// caring for the cat always brings it straight back to HEALTHY.
export const ATTENTION_AFTER_DAYS = 2;
export const SICK_AFTER_DAYS = 5;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysSince(timestampMs, nowMs = Date.now()) {
  return (nowMs - timestampMs) / MS_PER_DAY;
}

/**
 * Pure function of "how long has it been" -> current health state.
 * Takes lastInteractionAt/now instead of internal state so it's trivial to
 * test and to re-derive on every app load (no ticking timer needed).
 */
export function computeCatHealth(lastInteractionAtMs, nowMs = Date.now()) {
  const elapsedDays = daysSince(lastInteractionAtMs, nowMs);

  if (elapsedDays >= SICK_AFTER_DAYS) return CatHealth.SICK;
  if (elapsedDays >= ATTENTION_AFTER_DAYS) return CatHealth.NEEDS_ATTENTION;
  return CatHealth.HEALTHY;
}
