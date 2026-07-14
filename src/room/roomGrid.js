import { ROOM_ART_NATIVE_WIDTH_PX, ROOM_ART_NATIVE_HEIGHT_PX } from './pixelScale.js';

export const FLOOR_ROWS = 8;
export const FLOOR_COLS = 8;

// The room has a left wall and a right wall meeting at a back corner —
// two independent addressable grids, not one combined wall region. Each
// face matches the floor's edge length (8 wide) and is 6 rows tall
// visually (kickboard + hangable zone below it — see WALL_HANGABLE_ROWS).
export const WALL_FACES = Object.freeze(['left', 'right']);
export const WALL_ROWS = 6;
export const WALL_COLS = FLOOR_COLS;

export function centerOf(rows, cols) {
  return { row: Math.floor(rows / 2), col: Math.floor(cols / 2) };
}

export const DEFAULT_CAT_POSITION = centerOf(FLOOR_ROWS, FLOOR_COLS);

// ---- True isometric projection ----
//
// The room art (public/sprites/room/TestFloor1.png, TestWalls1.png) is a
// genuine 2:1 isometric projection, not a flat top-down grid — the floor
// is one big diamond made of 8x8 smaller diamond tiles, and the two wall
// faces are parallelograms sharing its top vertex. Measuring the actual
// art's pixel data (on the 512x448 native canvas) gives the floor
// diamond's four vertices exactly:
//   top (the room's back corner, shared with both walls): (256, 193)
//   right:                                                 (512, 320)
//   bottom:                                                (256, 447)
//   left:                                                  (0,   320)
// A flat-fraction rectangular grid (the old approach here) cannot
// represent this: every column's true wall/floor boundary sits at a
// different screen height, rising and falling diagonally toward the back
// corner, so anchoring against a single flat "floor starts at 35% down"
// line put items at the wrong height by a different amount depending on
// which column they were in.
const FLOOR_ORIGIN_X = 256; // native px -- the back corner, col=0,row=0
const FLOOR_ORIGIN_Y = 193;
const TILE_HALF_WIDTH = (512 - FLOOR_ORIGIN_X) / FLOOR_COLS; // 32
const TILE_HALF_HEIGHT = (447 - FLOOR_ORIGIN_Y) / (FLOOR_ROWS + FLOOR_COLS); // 15.875

// A "corner" is a lattice point between tiles: cell (row, col) spans from
// corner(row, col) to corner(row+1, col+1). This is the standard 2:1
// isometric transform — moving one column shifts the screen point
// down-right, moving one row shifts it down-left, and together they
// tessellate into the diamond grid the art actually shows. Fractional
// row/col are valid too (used below for cell centers).
function floorCorner({ row, col }) {
  return {
    x: FLOOR_ORIGIN_X + (col - row) * TILE_HALF_WIDTH,
    y: FLOOR_ORIGIN_Y + (row + col) * TILE_HALF_HEIGHT,
  };
}

// The walls are the same isometric camera, extruded upward from the
// floor's own row=0 edges: the left wall sits above the floor edge that
// runs from the back corner out to the floor's LEFT vertex (i.e. the
// floor's col=0 edge, parameterized by row), and the right wall sits
// above the edge running out to the floor's RIGHT vertex (the floor's
// row=0 edge, parameterized by col). A wall's own "row" axis (0 = top /
// ceiling line, WALL_ROWS = bottom, where it meets the floor) is pure
// vertical world height, which is why it only ever shifts the screen
// point straight down, with none of the horizontal skew that col has —
// verticality doesn't skew in an isometric projection the way depth
// along the ground plane does.
const WALL_ROW_HEIGHT = FLOOR_ORIGIN_Y / WALL_ROWS; // the wall's full vertical extent (0 to the back corner), divided across its rows

function wallCorner({ face, row, col }) {
  const signX = face === 'left' ? -1 : 1;
  return {
    x: FLOOR_ORIGIN_X + signX * col * TILE_HALF_WIDTH,
    y: col * TILE_HALF_HEIGHT + row * WALL_ROW_HEIGHT,
  };
}

function toPercentPoint({ x, y }) {
  return { xPercent: (x / ROOM_ART_NATIVE_WIDTH_PX) * 100, yPercent: (y / ROOM_ART_NATIVE_HEIGHT_PX) * 100 };
}

/** A cell's center point, as room-relative percentages. */
export function floorPosition({ row, col }) {
  return toPercentPoint(floorCorner({ row: row + 0.5, col: col + 0.5 }));
}

// Unlike floorPosition (always a cell's center), this projects a raw
// continuous (row, col) point -- fractional values included -- straight
// through the isometric transform with no +0.5 centering. Since that
// transform is linear, any point with fractional parts in [0, 1) maps to
// somewhere inside that tile's own diamond, not just its bounding box.
// That's what makes it possible to walk a moving entity to an "organic"
// point within a tile (not just its center) and to any point in between
// two tiles while it's still in transit, using this exact same formula.
export function floorPointPosition(point) {
  return toPercentPoint(floorCorner(point));
}

export function wallPosition({ face, row, col }) {
  return toPercentPoint(wallCorner({ face, row: row + 0.5, col: col + 0.5 }));
}

const SINGLE_TILE = { width: 1, height: 1 };

function toPercentRect({ left, top, width, height }) {
  return {
    leftPercent: (left / ROOM_ART_NATIVE_WIDTH_PX) * 100,
    topPercent: (top / ROOM_ART_NATIVE_HEIGHT_PX) * 100,
    widthPercent: (width / ROOM_ART_NATIVE_WIDTH_PX) * 100,
    heightPercent: (height / ROOM_ART_NATIVE_HEIGHT_PX) * 100,
  };
}

/** A single tile's own bounding box (in native px), from its 4 diamond corners. */
function cellBoxNative(cornerFn, anchor) {
  const { row, col } = anchor;
  const corners = [
    cornerFn({ ...anchor, row, col }),
    cornerFn({ ...anchor, row, col: col + 1 }),
    cornerFn({ ...anchor, row: row + 1, col }),
    cornerFn({ ...anchor, row: row + 1, col: col + 1 }),
  ];
  const xs = corners.map((point) => point.x);
  const ys = corners.map((point) => point.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return { left, top, width: Math.max(...xs) - left, height: Math.max(...ys) - top };
}

export function floorCellRect(position) {
  return toPercentRect(cellBoxNative(floorCorner, position));
}

export function wallCellRect(position) {
  return toPercentRect(cellBoxNative(wallCorner, position));
}

export function isValidPosition({ row, col }, { rows, cols }) {
  return Number.isInteger(row) && Number.isInteger(col) && row >= 0 && row < rows && col >= 0 && col < cols;
}

export function isValidFloorPosition(position) {
  return isValidPosition(position, { rows: FLOOR_ROWS, cols: FLOOR_COLS });
}

export function isValidWallFace(face) {
  return WALL_FACES.includes(face);
}

/** position is { face, row, col } — a face is required, not optional. */
export function isValidWallPosition({ face, row, col }) {
  return isValidWallFace(face) && isValidPosition({ row, col }, { rows: WALL_ROWS, cols: WALL_COLS });
}

/**
 * Expands a single-cell rect function (floorCellRect, or wallCellRect
 * bound to a face) into a bounding box spanning an anchor's full
 * footprint. Diamonds tessellate diagonally, so a footprint spanning
 * both multiple rows AND multiple columns (e.g. the plant's 2x2) has its
 * own leftmost/rightmost/topmost/bottommost points at DIFFERENT corners
 * than just its anchor and far tile — the anchor tile's own left vertex,
 * for instance, is not the whole footprint's leftmost point once a
 * second row is added below it, since a lower row's diamond reaches
 * further left. Unioning every individual tile's own (already-correct)
 * bounding box across the whole footprint sidesteps having to reason
 * about which specific corner is extreme for a given footprint shape.
 */
export function getFootprintScreenRect(cellRectFn, anchor, footprint) {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (let dRow = 0; dRow < footprint.height; dRow++) {
    for (let dCol = 0; dCol < footprint.width; dCol++) {
      const cell = cellRectFn({ ...anchor, row: anchor.row + dRow, col: anchor.col + dCol });
      left = Math.min(left, cell.leftPercent);
      top = Math.min(top, cell.topPercent);
      right = Math.max(right, cell.leftPercent + cell.widthPercent);
      bottom = Math.max(bottom, cell.topPercent + cell.heightPercent);
    }
  }

  return { leftPercent: left, topPercent: top, widthPercent: right - left, heightPercent: bottom - top };
}

/**
 * Which floor tiles count as "against a wall," for onFloorAgainstWall
 * placement (e.g. a bookshelf). The floor and wall are independent
 * grids, so there's no per-column mapping between them — this is a
 * property of the room's shape instead: row 0 is the floor row closest
 * to the wall (its far edge is the back corner both walls share). If the
 * room grows a third wall (e.g. facing the camera) later, this becomes
 * `row === 0 || col === 0 || col === FLOOR_COLS - 1` — the one place
 * that changes, not every caller that checks wall-adjacency.
 */
export function isAgainstWall({ row }) {
  return row === 0;
}

// The bottom-most wall rows (closest to the floor) render as a
// "kickboard" transition band and are never valid for onWall placement —
// only the hangable zone above it is real wall-mounting space. Row 0 is
// the TOP of the wall (nearest the ceiling line), rows increase downward
// toward the floor, so the kickboard is the LAST WALL_KICKBOARD_ROWS row
// indices, not the first. Both faces share this row convention, so it
// isn't face-specific.
export const WALL_KICKBOARD_ROWS = 2;
export const WALL_HANGABLE_ROWS = WALL_ROWS - WALL_KICKBOARD_ROWS;

export function isInHangableWallZone({ row }) {
  return row < WALL_HANGABLE_ROWS;
}
