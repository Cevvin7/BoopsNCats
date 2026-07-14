import { FLOOR_ROWS, FLOOR_COLS } from '../room/roomGrid.js';

export const IDLE_ANIMATIONS = Object.freeze(['SitIdle', 'StandIdle']);
export const WALK_ANIMATION = 'Walking';

const IDLE_INTERVAL_MIN_MS = 30_000;
const IDLE_INTERVAL_MAX_MS = 240_000;

const WANDER_INTERVAL_BASE_MS = 30_000;
// "~30 seconds" -- a little jitter so it doesn't feel like a rigid metronome.
const WANDER_INTERVAL_JITTER_MS = 5_000;

// An arbitrary, tunable walking pace -- distance is measured in grid
// units (tiles), not pixels, so this stays correct regardless of pixel
// scale or room size.
const WALK_SPEED_TILES_PER_SECOND = 1;

// 64 tiles total; even with several pieces of furniture down, the odds of
// failing to find a free tile within this many random draws are
// astronomically small. This bound exists purely so a (currently
// impossible, but not worth trusting blindly) fully-occupied board can't
// spin forever -- it just skips that wander cycle instead.
const MAX_PICK_ATTEMPTS = 200;

/**
 * Picks a random free floor tile by drawing random tiles and rejecting
 * ones that are occupied or match `excludeTile` (the cat's current
 * destination, so a new wander cycle doesn't just re-target the same
 * spot), re-drawing until one is found. Returns null if no free tile
 * turns up within the attempt budget (an effectively-full board).
 */
export function pickWanderDestinationTile({
  isTileFree,
  excludeTile = null,
  random = Math.random,
  rows = FLOOR_ROWS,
  cols = FLOOR_COLS,
}) {
  for (let attempt = 0; attempt < MAX_PICK_ATTEMPTS; attempt++) {
    const row = Math.floor(random() * rows);
    const col = Math.floor(random() * cols);
    if (excludeTile && row === excludeTile.row && col === excludeTile.col) continue;
    if (!isTileFree({ row, col })) continue;
    return { row, col };
  }
  return null;
}

// A tile in grid space is the unit square [row, row+1) x [col, col+1),
// and the isometric projection (roomGrid.js's floorCorner) is linear --
// so any point drawn from that square maps to somewhere inside the
// tile's own diamond on screen, not just its bounding box. That's what
// makes this "organic" rather than grid-snapped without needing any
// screen-space geometry here at all.
export function randomPointInTile({ row, col }, random = Math.random) {
  return { row: row + random(), col: col + random() };
}

export function pickIdleAnimation(random = Math.random) {
  return IDLE_ANIMATIONS[Math.floor(random() * IDLE_ANIMATIONS.length)];
}

export function randomIdleIntervalMs(random = Math.random) {
  return IDLE_INTERVAL_MIN_MS + random() * (IDLE_INTERVAL_MAX_MS - IDLE_INTERVAL_MIN_MS);
}

export function randomWanderIntervalMs(random = Math.random) {
  return WANDER_INTERVAL_BASE_MS + (random() * 2 - 1) * WANDER_INTERVAL_JITTER_MS;
}

export function walkDurationMs(distanceInTiles) {
  if (distanceInTiles <= 0) return 0;
  return (distanceInTiles / WALK_SPEED_TILES_PER_SECOND) * 1000;
}
