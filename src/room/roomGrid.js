export const FLOOR_ROWS = 8;
export const FLOOR_COLS = 8;

// The room has a left wall and a right wall meeting at a back corner —
// two independent addressable grids, not one combined wall region. Each
// face matches the floor's edge length (8 wide) and is 6 rows tall
// visually (kickboard + hangable zone below it — see WALL_HANGABLE_ROWS).
export const WALL_FACES = Object.freeze(['left', 'right']);
export const WALL_ROWS = 6;
export const WALL_COLS = FLOOR_COLS;

const WALL_HEIGHT_FRACTION = 0.35;
const FLOOR_HEIGHT_FRACTION = 1 - WALL_HEIGHT_FRACTION;

// Regions are rectangles expressed as 0-1 fractions of the room container,
// not pixels — so the whole system stays resolution-independent. The two
// wall faces split the room's width in half, meeting at the center (the
// room's back corner in the isometric art).
export const WALL_FACE_REGIONS = {
  left: { rows: WALL_ROWS, cols: WALL_COLS, top: 0, left: 0, width: 0.5, height: WALL_HEIGHT_FRACTION },
  right: { rows: WALL_ROWS, cols: WALL_COLS, top: 0, left: 0.5, width: 0.5, height: WALL_HEIGHT_FRACTION },
};
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
 * caller (cat, inventory items) keeps working unmodified.
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

/**
 * Like createGridProjection, but returns a cell's full bounding box
 * (as room-relative percentages) instead of just its center point —
 * needed to render a tile (or a multi-tile footprint) as a
 * highlightable/clickable rectangle rather than position a single
 * point-like entity on it.
 */
export function createGridCellRect({ rows, cols, top, left, width, height }) {
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  return function toScreenRect({ row, col }) {
    return {
      leftPercent: (left + cellWidth * col) * 100,
      topPercent: (top + cellHeight * row) * 100,
      widthPercent: cellWidth * 100,
      heightPercent: cellHeight * 100,
    };
  };
}

export function isValidPosition({ row, col }, { rows, cols }) {
  return Number.isInteger(row) && Number.isInteger(col) && row >= 0 && row < rows && col >= 0 && col < cols;
}

export const floorPosition = createGridProjection(FLOOR_REGION);
export const floorCellRect = createGridCellRect(FLOOR_REGION);

export function isValidFloorPosition(position) {
  return isValidPosition(position, FLOOR_REGION);
}

const WALL_FACE_PROJECTIONS = {
  left: createGridProjection(WALL_FACE_REGIONS.left),
  right: createGridProjection(WALL_FACE_REGIONS.right),
};
const WALL_FACE_CELL_RECTS = {
  left: createGridCellRect(WALL_FACE_REGIONS.left),
  right: createGridCellRect(WALL_FACE_REGIONS.right),
};

export function isValidWallFace(face) {
  return WALL_FACES.includes(face);
}

/** position is { face, row, col } — a face is required, not optional. */
export function isValidWallPosition({ face, row, col }) {
  return isValidWallFace(face) && isValidPosition({ row, col }, { rows: WALL_ROWS, cols: WALL_COLS });
}

export function wallPosition({ face, row, col }) {
  return WALL_FACE_PROJECTIONS[face]({ row, col });
}

export function wallCellRect({ face, row, col }) {
  return WALL_FACE_CELL_RECTS[face]({ row, col });
}

/**
 * Expands a single-cell rect function (floorCellRect, or wallCellRect
 * bound to a face) into a bounding box spanning an anchor's full
 * footprint, by combining the anchor cell's top-left corner with the far
 * corner cell's bottom-right corner. One helper covers both floor and
 * wall items since it just takes whichever cellRectFn already knows how
 * to look up a single cell.
 */
export function getFootprintScreenRect(cellRectFn, anchor, footprint) {
  const anchorRect = cellRectFn(anchor);
  const farCellPosition = { ...anchor, row: anchor.row + footprint.height - 1, col: anchor.col + footprint.width - 1 };
  const farRect = cellRectFn(farCellPosition);

  return {
    leftPercent: anchorRect.leftPercent,
    topPercent: anchorRect.topPercent,
    widthPercent: farRect.leftPercent + farRect.widthPercent - anchorRect.leftPercent,
    heightPercent: farRect.topPercent + farRect.heightPercent - anchorRect.topPercent,
  };
}

/**
 * Which floor tiles count as "against a wall," for onFloorAgainstWall
 * placement (e.g. a bookshelf). The floor and wall are independent
 * grids, so there's no per-column mapping between them — this is a
 * property of the room's shape instead: row 0 is the floor row closest
 * to the wall region (FLOOR_REGION.top starts exactly where the wall
 * faces end), regardless of which wall face a given wall item is on.
 * If the room grows a third wall (e.g. facing the camera) later, this
 * becomes `row === 0 || col === 0 || col === FLOOR_COLS - 1` — the one
 * place that changes, not every caller that checks wall-adjacency.
 */
export function isAgainstWall({ row }) {
  return row === 0;
}

// The bottom-most wall rows (closest to the floor) render as a
// "kickboard" transition band and are never valid for onWall placement —
// only the hangable zone above it is real wall-mounting space. Row 0 is
// the TOP of the wall (each face's region has top = 0, rows increase
// downward toward the floor — see createGridProjection), so the
// kickboard is the LAST WALL_KICKBOARD_ROWS row indices, not the first.
// Both faces share this row convention, so it isn't face-specific.
export const WALL_KICKBOARD_ROWS = 2;
export const WALL_HANGABLE_ROWS = WALL_ROWS - WALL_KICKBOARD_ROWS;

export function isInHangableWallZone({ row }) {
  return row < WALL_HANGABLE_ROWS;
}
