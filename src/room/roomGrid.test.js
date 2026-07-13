import { describe, it, expect } from 'vitest';
import {
  createGridProjection,
  isValidPosition,
  centerOf,
  FLOOR_REGION,
  WALL_FACE_REGIONS,
  WALL_FACES,
  FLOOR_ROWS,
  FLOOR_COLS,
  WALL_ROWS,
  WALL_COLS,
  DEFAULT_CAT_POSITION,
  ROOM_ASPECT_RATIO,
  floorPosition,
  wallPosition,
  isValidFloorPosition,
  isValidWallPosition,
  isValidWallFace,
  isAgainstWall,
  createGridCellRect,
  floorCellRect,
  wallCellRect,
  isInHangableWallZone,
  WALL_HANGABLE_ROWS,
  WALL_KICKBOARD_ROWS,
  getFootprintScreenRect,
} from './roomGrid.js';

describe('createGridProjection', () => {
  it('places cell centers correctly in a simple full-room 2x2 region', () => {
    const project = createGridProjection({ rows: 2, cols: 2, top: 0, left: 0, width: 1, height: 1 });
    expect(project({ row: 0, col: 0 })).toEqual({ xPercent: 25, yPercent: 25 });
    expect(project({ row: 0, col: 1 })).toEqual({ xPercent: 75, yPercent: 25 });
    expect(project({ row: 1, col: 0 })).toEqual({ xPercent: 25, yPercent: 75 });
    expect(project({ row: 1, col: 1 })).toEqual({ xPercent: 75, yPercent: 75 });
  });

  it('offsets correctly for a region that does not start at the room origin', () => {
    // A 2-row, 1-col region occupying the bottom half of the room.
    const project = createGridProjection({ rows: 2, cols: 1, top: 0.5, left: 0, width: 1, height: 0.5 });
    expect(project({ row: 0, col: 0 })).toEqual({ xPercent: 50, yPercent: 62.5 });
    expect(project({ row: 1, col: 0 })).toEqual({ xPercent: 50, yPercent: 87.5 });
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

  it('centers the default cat position within the floor grid bounds', () => {
    const { xPercent, yPercent } = floorPosition(DEFAULT_CAT_POSITION);
    expect(xPercent).toBeGreaterThan(0);
    expect(xPercent).toBeLessThan(100);
    expect(yPercent).toBeGreaterThan(FLOOR_REGION.top * 100);
    expect(yPercent).toBeLessThan(100);
  });

  it('places the left face entirely left of the right face, meeting at the center', () => {
    const leftFar = wallPosition({ face: 'left', row: 0, col: WALL_COLS - 1 });
    const rightNear = wallPosition({ face: 'right', row: 0, col: 0 });
    expect(leftFar.xPercent).toBeLessThan(50);
    expect(rightNear.xPercent).toBeGreaterThan(50);
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

describe('createGridCellRect', () => {
  it('returns each cell\'s bounding box within a simple 2x2 region', () => {
    const rect = createGridCellRect({ rows: 2, cols: 2, top: 0, left: 0, width: 1, height: 1 });
    expect(rect({ row: 0, col: 0 })).toEqual({ leftPercent: 0, topPercent: 0, widthPercent: 50, heightPercent: 50 });
    expect(rect({ row: 1, col: 1 })).toEqual({ leftPercent: 50, topPercent: 50, widthPercent: 50, heightPercent: 50 });
  });

  it('agrees with createGridProjection about where a cell center is', () => {
    const project = createGridProjection(FLOOR_REGION);
    const rect = floorCellRect({ row: 3, col: 2 });
    const center = project({ row: 3, col: 2 });
    expect(rect.leftPercent + rect.widthPercent / 2).toBeCloseTo(center.xPercent, 10);
    expect(rect.topPercent + rect.heightPercent / 2).toBeCloseTo(center.yPercent, 10);
  });

  it('sizes wall cells using a single face\'s region dimensions, not the floor\'s', () => {
    const rect = wallCellRect({ face: 'left', row: 0, col: 0 });
    expect(rect.widthPercent).toBeCloseTo((WALL_FACE_REGIONS.left.width / WALL_COLS) * 100, 10);
    expect(rect.heightPercent).toBeCloseTo((WALL_FACE_REGIONS.left.height / WALL_ROWS) * 100, 10);
  });

  it('gives the two faces the same shape but different screen positions', () => {
    const left = wallCellRect({ face: 'left', row: 2, col: 3 });
    const right = wallCellRect({ face: 'right', row: 2, col: 3 });
    expect(left.widthPercent).toBeCloseTo(right.widthPercent, 10);
    expect(left.heightPercent).toBeCloseTo(right.heightPercent, 10);
    expect(left.leftPercent).not.toBeCloseTo(right.leftPercent, 5);
  });
});

describe('getFootprintScreenRect', () => {
  it('matches a single cell\'s own rect for a 1x1 footprint', () => {
    const rect = getFootprintScreenRect(floorCellRect, { row: 2, col: 3 }, { width: 1, height: 1 });
    expect(rect).toEqual(floorCellRect({ row: 2, col: 3 }));
  });

  it('spans from the anchor\'s top-left to the far cell\'s bottom-right for a multi-tile footprint', () => {
    const anchorRect = floorCellRect({ row: 2, col: 3 });
    const farRect = floorCellRect({ row: 3, col: 4 }); // anchor + (2x2 - 1) in both dims
    const rect = getFootprintScreenRect(floorCellRect, { row: 2, col: 3 }, { width: 2, height: 2 });

    expect(rect.leftPercent).toBeCloseTo(anchorRect.leftPercent, 10);
    expect(rect.topPercent).toBeCloseTo(anchorRect.topPercent, 10);
    expect(rect.widthPercent).toBeCloseTo(farRect.leftPercent + farRect.widthPercent - anchorRect.leftPercent, 10);
    expect(rect.heightPercent).toBeCloseTo(farRect.topPercent + farRect.heightPercent - anchorRect.topPercent, 10);
    // Sanity check against the plain single-cell width/height: a 2x2
    // footprint should measure out to exactly twice one cell's size.
    expect(rect.widthPercent).toBeCloseTo(anchorRect.widthPercent * 2, 10);
    expect(rect.heightPercent).toBeCloseTo(anchorRect.heightPercent * 2, 10);
  });

  it('works with a face-bound wall cell rect function for a wide wall footprint', () => {
    const rect = getFootprintScreenRect(wallCellRect, { face: 'left', row: 0, col: 0 }, { width: 4, height: 1 });
    const singleCell = wallCellRect({ face: 'left', row: 0, col: 0 });
    expect(rect.widthPercent).toBeCloseTo(singleCell.widthPercent * 4, 10);
    expect(rect.heightPercent).toBeCloseTo(singleCell.heightPercent, 10);
  });
});

describe('centerOf', () => {
  it('floors to the nearest integer cell for both even and odd sizes', () => {
    expect(centerOf(8, 8)).toEqual({ row: 4, col: 4 });
    expect(centerOf(5, 3)).toEqual({ row: 2, col: 1 });
  });
});

describe('DEFAULT_CAT_POSITION and ROOM_ASPECT_RATIO', () => {
  it('defaults the cat to the center of the floor grid', () => {
    expect(DEFAULT_CAT_POSITION).toEqual(centerOf(FLOOR_ROWS, FLOOR_COLS));
  });

  it('derives the room aspect ratio from the floor region so cells render square', () => {
    expect(ROOM_ASPECT_RATIO).toBeCloseTo((FLOOR_COLS * FLOOR_REGION.height) / FLOOR_ROWS, 10);
  });
});
