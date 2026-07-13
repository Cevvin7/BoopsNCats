// Currency balance constant — tune this to rebalance how fast Boops accrue.
// 1 means "1 boop per meter walked/run/ridden."
export const BOOPS_PER_METER = 1;

/**
 * Converts a distance in meters to Boops, rounding any fractional boop up
 * at the end. Math.ceil intentionally rounds 0 up to 0 (not 1) — no
 * distance travelled earns nothing.
 */
export function metersToBoops(meters) {
  if (meters <= 0) return 0;
  return Math.ceil(meters * BOOPS_PER_METER);
}
