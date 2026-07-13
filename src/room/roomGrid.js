export const FLOOR_ROWS = 8;
export const FLOOR_COLS = 8;

// "Roughly 15" wall-mountable positions — a 5x3 grid gives exactly 15
// while staying its own addressable space, independent of the floor's
// row/col numbering.
export const WALL_ROWS = 3;
export const WALL_COLS = 5;

const WALL_HEIGHT_FRACTION = 0.35;
const FLOOR_HEIGHT_FRACTION = 1 - WALL_HEIGHT_FRACTION;

// Regions are rectangles expressed as 0-1 fractions of the room container,
// not pixels — so the whole system stays resolution-independent.
export const WALL_REGION = { rows: WALL_ROWS, cols: WALL_COLS, top: 0, left: 0, width: 1, height: WALL_HEIGHT_FRACTION };
export const FLOOR_REGION = { rows: FLOOR_ROWS, cols: FLOOR_COLS, top: WALL_HEIGHT_FRACTION, left: 0, width: 1, height: FLOOR_HEIGHT_FRACTION };

// Derived (not hardcoded) so the room's CSS aspect-ratio can never drift
// out of sync with the floor grid's actual row/col counts: this is the
// width:height ratio that makes each floor cell come out square.
export const ROOM_ASPECT_RATIO = (FLOOR_COLS * FLOOR_HEIGHT_FRACTION) / FLOOR_ROWS;

export function centerOf(rows, cols) {
  return { row: Math.floor(rows / 2), col: Math.floor(cols / 2) };
}

export const DEFAULT_CAT_POSITION = centerOf(FLOOR_ROWS, FLOOR_COLS);

/**
 * Builds a (row, col) -> {xPercent, yPercent} function scoped to one
 * region of the room. The returned percentages are relative to the WHOLE
 * room container, so callers can plug them straight into
 * style={{ left: `${xPercent}%`, top: `${yPercent}%` }} on an
 * absolutely-positioned element without knowing anything about where the
 * region sits.
 *
 * This is the one piece meant to change when real isometric art arrives —
 * swap the math inside toScreenPercent for a diamond projection and every
 * caller (cat, future inventory items) keeps working unmodified.
 */
export function createGridProjection({ rows, cols, top, left, width, height }) {
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  return function toScreenPercent({ row, col }) {
    const xFraction = left + cellWidth * (col + 0.5);
    const yFraction = top + cellHeight * (row + 0.5);
    return { xPercent: xFraction * 100, yPercent: yFraction * 100 };
  };
}

export function isValidPosition({ row, col }, { rows, cols }) {
  return Number.isInteger(row) && Number.isInteger(col) && row >= 0 && row < rows && col >= 0 && col < cols;
}

export const floorPosition = createGridProjection(FLOOR_REGION);
export const wallPosition = createGridProjection(WALL_REGION);

export function isValidFloorPosition(position) {
  return isValidPosition(position, FLOOR_REGION);
}

export function isValidWallPosition(position) {
  return isValidPosition(position, WALL_REGION);
}
