export const MAX_HAPPINESS = 7;

export function defaultCat(nowMs = Date.now()) {
  return {
    happiness: MAX_HAPPINESS,
    lastActivityUpload: nowMs,
    lastDecayCheck: nowMs,
  };
}

export function needsAttention(cat) {
  return cat.happiness === 0;
}

/**
 * Local noon is used as a fixed daily checkpoint rather than "24 hours
 * after the last check" — that keeps the decrement anchored to the same
 * real-world moment every day regardless of what time an upload happened,
 * and Date's local getters/setDate already handle DST shifts correctly
 * (setDate(d + 1) lands on the next calendar day at the same wall-clock
 * hour, adjusting the UTC offset for you).
 */
function nextLocalNoonAfter(ms) {
  const d = new Date(ms);
  const noon = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
  if (noon.getTime() <= ms) {
    noon.setDate(noon.getDate() + 1);
  }
  return noon;
}

export function countNoonsCrossed(fromMs, toMs) {
  if (toMs <= fromMs) return 0;

  let noon = nextLocalNoonAfter(fromMs);
  let count = 0;
  // No point counting past MAX_HAPPINESS — happiness floors at 0 either way.
  while (noon.getTime() <= toMs && count < MAX_HAPPINESS) {
    count++;
    noon.setDate(noon.getDate() + 1);
  }
  return count;
}

/**
 * Re-derives happiness from elapsed local noons since the last check.
 * Returns the same object (no new reference) when nothing changed, so
 * callers can skip a state update / re-render.
 */
export function applyHappinessDecay(cat, nowMs = Date.now()) {
  const elapsedNoons = countNoonsCrossed(cat.lastDecayCheck, nowMs);
  if (elapsedNoons === 0) return cat;

  return {
    ...cat,
    happiness: Math.max(0, cat.happiness - elapsedNoons),
    lastDecayCheck: nowMs,
  };
}

export function recordActivityUpload(cat, nowMs = Date.now()) {
  return {
    ...cat,
    happiness: MAX_HAPPINESS,
    lastActivityUpload: nowMs,
    lastDecayCheck: nowMs,
  };
}
