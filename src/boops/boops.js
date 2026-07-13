/**
 * 1 boop per meter, rounding any fractional meter up. Math.ceil intentionally
 * rounds 0 up to 0 (not 1) — no distance travelled earns nothing.
 */
export function metersToBoops(meters) {
  if (meters <= 0) return 0;
  return Math.ceil(meters);
}
