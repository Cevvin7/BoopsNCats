// Currency balance constants -- tune these to rebalance how fast Boops
// accrue as the economy gets tested.
export const BASE_BOOPS_PER_10_METERS = 1; // running, walking, or no listed activity type
export const CYCLING_MULTIPLIER = 0.5; // applied on top of the base rate for cycling activities

// Matches free-text GPX <type> values like "cycling", "Cycling", "biking",
// "mountain bike" -- anything else (running, walking, missing/unrecognized
// type) falls back to the base rate.
const CYCLING_TYPE_PATTERN = /cycl|bik/i;

export function isCyclingActivity(activityType) {
  return typeof activityType === 'string' && CYCLING_TYPE_PATTERN.test(activityType);
}

function boopsPerMeter(activityType) {
  const multiplier = isCyclingActivity(activityType) ? CYCLING_MULTIPLIER : 1;
  return (BASE_BOOPS_PER_10_METERS / 10) * multiplier;
}

/**
 * Converts a distance in meters to Boops, scaled by activity type and
 * rounded up at the end in the user's favor. Math.ceil intentionally
 * rounds 0 up to 0 (not 1) -- no distance travelled earns nothing.
 */
export function metersToBoops(meters, activityType) {
  if (meters <= 0) return 0;
  return Math.ceil(meters * boopsPerMeter(activityType));
}
