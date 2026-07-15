/**
 * Which sprite-sheet frame index a tile at (row, col) should show for a
 * given theme -- cycles through every frame in the theme's own range
 * (inclusive), so a 1-frame range is solid, a 2-frame range alternates
 * in the classic checkerboard pattern, and a wider range repeats a
 * longer motif. `range` is `[start, end]`.
 */
export function tileVariantIndex(theme, row, col) {
  const [start, end] = theme.range;
  const length = end - start + 1;
  return start + ((row + col) % length);
}
