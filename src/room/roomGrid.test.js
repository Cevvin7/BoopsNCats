import { describe, it, expect } from 'vitest';
import {
  isValidPosition,
  centerOf,
  WALL_FACES,
  FLOOR_ROWS,
  FLOOR_COLS,
  WALL_ROWS,
  WALL_COLS,
  DEFAULT_CAT_POSITION,
  floorPosition,
  floorPointPosition,
  wallPosition,
  isValidFloorPosition,
  isValidWallPosition,
  isValidWallFace,
  isAgainstWall,
  floorCellRect,
  wallCellRect,
  isInHangableWallZone,
  WALL_HANGABLE_ROWS,
  WALL_KICKBOARD_ROWS,
  getFootprintScreenRect,
} from './roomGrid.js';

// The four vertices below are read directly off the room art's pixel data
// (public/sprites/room/TestFloor1.png, a 512x448 canvas) and are the
// ground truth the whole isometric projection is calibrated against.
const FLOOR_TOP_PERCENT = { xPercent: (256 / 512) * 100, yPercent: (193 / 448) * 100 };
const FLOOR_RIGHT_PERCENT = { xPercent: 100, yPercent: (320 / 448) * 100 };
const FLOOR_BOTTOM_PERCENT = { xPercent: (256 / 512) * 100, yPercent: (447 / 448) * 100 };
const FLOOR_LEFT_PERCENT = { xPercent: 0, yPercent: (320 / 448) * 100 };

describe('floorCellRect', () => {
  it('places the whole floor grid\'s outer corners at the art\'s measured diamond vertices', () => {
    // Corner (0,0) -- the anchor point of the top-left-most cell -- is the
    // diamond's TOP vertex: the top-most point of that cell's own box,
    // and horizontally centered within it (same "side vertex" geometry
    // as the LEFT/RIGHT checks below, just for the top/bottom pair).
    const topLeftCell = floorCellRect({ row: 0, col: 0 });
    expect(topLeftCell.leftPercent + topLeftCell.widthPercent / 2).toBeCloseTo(FLOOR_TOP_PERCENT.xPercent, 5);
    expect(topLeftCell.topPercent).toBeCloseTo(FLOOR_TOP_PERCENT.yPercent, 5);

    // The far corner of cell (FLOOR_ROWS-1, FLOOR_COLS-1) is the diamond's
    // BOTTOM vertex -- the bottom-most point of that cell's own box, and
    // horizontally centered within it.
    const bottomCell = floorCellRect({ row: FLOOR_ROWS - 1, col: FLOOR_COLS - 1 });
    expect(bottomCell.leftPercent + bottomCell.widthPercent / 2).toBeCloseTo(FLOOR_BOTTOM_PERCENT.xPercent, 5);
    expect(bottomCell.topPercent + bottomCell.heightPercent).toBeCloseTo(FLOOR_BOTTOM_PERCENT.yPercent, 5);

    // The far corner of cell (FLOOR_ROWS-1, 0) is the diamond's LEFT
    // vertex -- the left-most point of that cell's own box. A diamond's
    // side vertices sit at the vertical MIDPOINT of the cell they anchor
    // (not the top or bottom), since they're the "side" points, not the
    // "front"/"back" ones.
    const leftCell = floorCellRect({ row: FLOOR_ROWS - 1, col: 0 });
    expect(leftCell.leftPercent).toBeCloseTo(FLOOR_LEFT_PERCENT.xPercent, 5);
    expect(leftCell.topPercent + leftCell.heightPercent / 2).toBeCloseTo(FLOOR_LEFT_PERCENT.yPercent, 5);

    // The far corner of cell (0, FLOOR_COLS-1) is the diamond's RIGHT vertex.
    const rightCell = floorCellRect({ row: 0, col: FLOOR_COLS - 1 });
    expect(rightCell.leftPercent + rightCell.widthPercent).toBeCloseTo(FLOOR_RIGHT_PERCENT.xPercent, 5);
    expect(rightCell.topPercent + rightCell.heightPercent / 2).toBeCloseTo(FLOOR_RIGHT_PERCENT.yPercent, 5);
  });

  it('sizes every floor tile as a 2:1 (64x31.75 native px) diamond, regardless of position', () => {
    const a = floorCellRect({ row: 0, col: 0 });
    const b = floorCellRect({ row: 3, col: 5 });
    const c = floorCellRect({ row: 7, col: 7 });
    for (const rect of [a, b, c]) {
      expect(rect.widthPercent).toBeCloseTo((64 / 512) * 100, 8);
      expect(rect.heightPercent).toBeCloseTo((31.75 / 448) * 100, 8);
    }
  });
});

describe('floorPosition / wallPosition', () => {
  it('keeps the floor grid below both wall faces, never overlapping them', () => {
    const topLeftOfFloor = floorPosition({ row: 0, col: 0 });
    const bottomOfLeftWall = wallPosition({ face: 'left', row: WALL_ROWS - 1, col: 0 });
    const bottomOfRightWall = wallPosition({ face: 'right', row: WALL_ROWS - 1, col: 0 });
    expect(topLeftOfFloor.yPercent).toBeGreaterThan(bottomOfLeftWall.yPercent);
    expect(topLeftOfFloor.yPercent).toBeGreaterThan(bottomOfRightWall.yPercent);
  });

  it('centers the default cat position within the floor diamond', () => {
    const { xPercent, yPercent } = floorPosition(DEFAULT_CAT_POSITION);
    expect(xPercent).toBeGreaterThan(0);
    expect(xPercent).toBeLessThan(100);
    expect(yPercent).toBeGreaterThan(FLOOR_TOP_PERCENT.yPercent);
    expect(yPercent).toBeLessThan(100);
  });

  it('places the left face entirely left of (or at) the room\'s horizontal center, and the right face at or right of it', () => {
    const leftFaceOuterEdge = wallPosition({ face: 'left', row: 0, col: WALL_COLS - 1 });
    const leftFaceNearCorner = wallPosition({ face: 'left', row: 0, col: 0 });
    const rightFaceOuterEdge = wallPosition({ face: 'right', row: 0, col: WALL_COLS - 1 });
    const rightFaceNearCorner = wallPosition({ face: 'right', row: 0, col: 0 });

    expect(leftFaceOuterEdge.xPercent).toBeLessThan(leftFaceNearCorner.xPercent);
    expect(leftFaceNearCorner.xPercent).toBeLessThanOrEqual(50);
    expect(rightFaceOuterEdge.xPercent).toBeGreaterThan(rightFaceNearCorner.xPercent);
    expect(rightFaceNearCorner.xPercent).toBeGreaterThanOrEqual(50);
  });

  it('keeps the col=0 seam of both wall faces exactly on the room\'s vertical center line, for every row', () => {
    // A wall's row (height up the wall) is a pure vertical shift with no
    // horizontal skew, so column 0's edge -- nearest the back corner --
    // sits at exactly the same X for every row: the floor's own top
    // vertex X (the room's horizontal center), not just approximately.
    for (const row of [0, Math.floor(WALL_ROWS / 2), WALL_ROWS - 1]) {
      const leftFaceInnerEdge = wallCellRect({ face: 'left', row, col: 0 });
      const rightFaceInnerEdge = wallCellRect({ face: 'right', row, col: 0 });
      expect(leftFaceInnerEdge.leftPercent + leftFaceInnerEdge.widthPercent).toBeCloseTo(FLOOR_TOP_PERCENT.xPercent, 8);
      expect(rightFaceInnerEdge.leftPercent).toBeCloseTo(FLOOR_TOP_PERCENT.xPercent, 8);
    }
  });
});

describe('floorPointPosition', () => {
  it('projects the raw grid origin to the floor diamond\'s measured top vertex, unlike floorPosition (which centers)', () => {
    const point = floorPointPosition({ row: 0, col: 0 });
    expect(point.xPercent).toBeCloseTo(FLOOR_TOP_PERCENT.xPercent, 8);
    expect(point.yPercent).toBeCloseTo(FLOOR_TOP_PERCENT.yPercent, 8);

    // floorPosition of the same {row: 0, col: 0}, by contrast, is that
    // cell's CENTER -- a different, later point.
    const center = floorPosition({ row: 0, col: 0 });
    expect(center.yPercent).toBeGreaterThan(point.yPercent);
  });

  it('places a fractional point strictly between the tile grid lines it interpolates across', () => {
    const nearCorner = floorPointPosition({ row: 2, col: 3 });
    const farCorner = floorPointPosition({ row: 3, col: 4 });
    const midpoint = floorPointPosition({ row: 2.5, col: 3.5 });

    expect(midpoint.xPercent).toBeCloseTo((nearCorner.xPercent + farCorner.xPercent) / 2, 8);
    expect(midpoint.yPercent).toBeCloseTo((nearCorner.yPercent + farCorner.yPercent) / 2, 8);
  });

  it('keeps any point with fractional parts in [0, 1) within that single tile\'s own bounding box', () => {
    const tile = floorCellRect({ row: 4, col: 2 });
    const point = floorPointPosition({ row: 4.37, col: 2.81 });
    expect(point.xPercent).toBeGreaterThanOrEqual(tile.leftPercent);
    expect(point.xPercent).toBeLessThanOrEqual(tile.leftPercent + tile.widthPercent);
    expect(point.yPercent).toBeGreaterThanOrEqual(tile.topPercent);
    expect(point.yPercent).toBeLessThanOrEqual(tile.topPercent + tile.heightPercent);
  });
});

describe('isValidPosition / isValidFloorPosition / isValidWallPosition', () => {
  it('accepts in-bounds integer positions and rejects everything else', () => {
    expect(isValidPosition({ row: 0, col: 0 }, { rows: 8, cols: 8 })).toBe(true);
    expect(isValidPosition({ row: 7, col: 7 }, { rows: 8, cols: 8 })).toBe(true);
    expect(isValidPosition({ row: 8, col: 0 }, { rows: 8, cols: 8 })).toBe(false);
    expect(isValidPosition({ row: -1, col: 0 }, { rows: 8, cols: 8 })).toBe(false);
    expect(isValidPosition({ row: 1.5, col: 0 }, { rows: 8, cols: 8 })).toBe(false);
  });

  it('validates against the real floor size', () => {
    expect(isValidFloorPosition({ row: FLOOR_ROWS - 1, col: FLOOR_COLS - 1 })).toBe(true);
    expect(isValidFloorPosition({ row: FLOOR_ROWS, col: 0 })).toBe(false);
  });

  it('validates wall positions against both bounds and a real face name', () => {
    expect(isValidWallPosition({ face: 'left', row: WALL_ROWS - 1, col: WALL_COLS - 1 })).toBe(true);
    expect(isValidWallPosition({ face: 'right', row: WALL_ROWS - 1, col: WALL_COLS - 1 })).toBe(true);
    expect(isValidWallPosition({ face: 'left', row: WALL_ROWS, col: 0 })).toBe(false);
    expect(isValidWallPosition({ face: 'up', row: 0, col: 0 })).toBe(false);
  });
});

describe('isValidWallFace / WALL_FACES', () => {
  it('recognizes exactly left and right as valid faces', () => {
    expect(WALL_FACES).toEqual(['left', 'right']);
    expect(isValidWallFace('left')).toBe(true);
    expect(isValidWallFace('right')).toBe(true);
    expect(isValidWallFace('front')).toBe(false);
  });
});

describe('isAgainstWall', () => {
  it('is true only for row 0, regardless of column', () => {
    expect(isAgainstWall({ row: 0, col: 0 })).toBe(true);
    expect(isAgainstWall({ row: 0, col: FLOOR_COLS - 1 })).toBe(true);
    expect(isAgainstWall({ row: 1, col: 0 })).toBe(false);
    expect(isAgainstWall({ row: FLOOR_ROWS - 1, col: 0 })).toBe(false);
  });
});

describe('isInHangableWallZone', () => {
  it('is true for the top (hangable) rows and false for the bottom kickboard rows, on either face', () => {
    expect(isInHangableWallZone({ row: 0 })).toBe(true);
    expect(isInHangableWallZone({ row: WALL_HANGABLE_ROWS - 1 })).toBe(true);
    expect(isInHangableWallZone({ row: WALL_HANGABLE_ROWS })).toBe(false);
    expect(isInHangableWallZone({ row: WALL_ROWS - 1 })).toBe(false);
  });

  it('reserves exactly WALL_KICKBOARD_ROWS rows at the bottom of the wall grid', () => {
    expect(WALL_HANGABLE_ROWS + WALL_KICKBOARD_ROWS).toBe(WALL_ROWS);
  });
});

describe('wallCellRect', () => {
  it('gives the two faces the same shape but different (mirrored) screen positions', () => {
    const left = wallCellRect({ face: 'left', row: 2, col: 3 });
    const right = wallCellRect({ face: 'right', row: 2, col: 3 });
    expect(left.widthPercent).toBeCloseTo(right.widthPercent, 10);
    expect(left.heightPercent).toBeCloseTo(right.heightPercent, 10);
    expect(left.leftPercent).not.toBeCloseTo(right.leftPercent, 5);
  });

  it('keeps every wall row the same height regardless of column (row is a pure vertical shift)', () => {
    const near = wallCellRect({ face: 'left', row: 0, col: 0 });
    const far = wallCellRect({ face: 'left', row: 0, col: WALL_COLS - 1 });
    expect(near.heightPercent).toBeCloseTo(far.heightPercent, 8);
  });
});

describe('getFootprintScreenRect', () => {
  it('matches a single cell\'s own rect for a 1x1 footprint', () => {
    const rect = getFootprintScreenRect(floorCellRect, { row: 2, col: 3 }, { width: 1, height: 1 });
    const single = floorCellRect({ row: 2, col: 3 });
    expect(rect.leftPercent).toBeCloseTo(single.leftPercent, 8);
    expect(rect.topPercent).toBeCloseTo(single.topPercent, 8);
    expect(rect.widthPercent).toBeCloseTo(single.widthPercent, 8);
    expect(rect.heightPercent).toBeCloseTo(single.heightPercent, 8);
  });

  // The expected native-px values below (verified independently with a
  // standalone script, not just re-derived from the implementation) show
  // why a footprint's bounding box can't be built from just its anchor
  // and far tile's own rects: diamonds tessellate diagonally, so
  // adjacent tiles along a row overlap in screen space. A 2-wide, 1-deep
  // floor footprint measures 96 native px wide -- not 128 (2x a single
  // tile's own 64px width) -- because the tessellation reduces the
  // "unique" additional span each further tile contributes.
  it('spans a 1-row-tall, 2-column-wide floor footprint to its true tessellated width, not naive 2x scaling', () => {
    const rect = getFootprintScreenRect(floorCellRect, { row: 0, col: 3 }, { width: 2, height: 1 });
    expect(rect.leftPercent).toBeCloseTo((320 / 512) * 100, 6);
    expect(rect.topPercent).toBeCloseTo((240.625 / 448) * 100, 6);
    expect(rect.widthPercent).toBeCloseTo((96 / 512) * 100, 6);
    expect(rect.heightPercent).toBeCloseTo((47.625 / 448) * 100, 6);
  });

  it('spans a footprint covering both multiple rows AND multiple columns to its true diamond-tessellation bounding box', () => {
    // A 2x2 footprint's own bounding box is NOT simply the anchor tile's
    // rect combined with the far tile's rect -- a lower row reaches
    // further to one side than the anchor row alone would suggest. This
    // is exactly the bug the old rectangular-grid math had no way to
    // hit (it had no row/col cross-coupling), and exactly what
    // getFootprintScreenRect's per-cell union has to get right for
    // footprints like the plant's 2x2.
    const rect = getFootprintScreenRect(floorCellRect, { row: 2, col: 3 }, { width: 2, height: 2 });
    expect(rect.leftPercent).toBeCloseTo((224 / 512) * 100, 6);
    expect(rect.topPercent).toBeCloseTo((272.375 / 448) * 100, 6);
    expect(rect.widthPercent).toBeCloseTo((128 / 512) * 100, 6);
    expect(rect.heightPercent).toBeCloseTo((63.5 / 448) * 100, 6);
  });

  // Unlike the floor, a wall's row axis is a pure vertical shift with no
  // horizontal skew, so a wide (multi-column) wall footprint's WIDTH
  // does scale naively (4 columns = 4x a single cell's width). Its
  // HEIGHT does not, though: each additional column also shifts that
  // column's vertical band further down the isometric slope, so a wide
  // single-row wall footprint's bounding box is taller than any one of
  // its own cells.
  it('works with a face-bound wall cell rect function for a wide wall footprint', () => {
    const rect = getFootprintScreenRect(wallCellRect, { face: 'left', row: 0, col: 0 }, { width: 4, height: 1 });
    const singleCell = wallCellRect({ face: 'left', row: 0, col: 0 });
    expect(rect.widthPercent).toBeCloseTo(singleCell.widthPercent * 4, 6);
    expect(rect.heightPercent).toBeCloseTo((95.66666666666666 / 448) * 100, 6);
    expect(rect.heightPercent).toBeGreaterThan(singleCell.heightPercent);
  });
});

describe('centerOf', () => {
  it('floors to the nearest integer cell for both even and odd sizes', () => {
    expect(centerOf(8, 8)).toEqual({ row: 4, col: 4 });
    expect(centerOf(5, 3)).toEqual({ row: 2, col: 1 });
  });
});

describe('DEFAULT_CAT_POSITION', () => {
  it('defaults the cat to the center of the floor grid', () => {
    expect(DEFAULT_CAT_POSITION).toEqual(centerOf(FLOOR_ROWS, FLOOR_COLS));
  });
});
