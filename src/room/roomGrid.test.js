import { describe, it, expect } from 'vitest';
import {
  createGridProjection,
  isValidPosition,
  centerOf,
  FLOOR_REGION,
  WALL_REGION,
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
  it('keeps the floor grid below the wall region, never overlapping it', () => {
    const topLeftOfFloor = floorPosition({ row: 0, col: 0 });
    const bottomOfWall = wallPosition({ row: WALL_ROWS - 1, col: 0 });
    expect(topLeftOfFloor.yPercent).toBeGreaterThan(bottomOfWall.yPercent);
  });

  it('centers the default cat position within the floor grid bounds', () => {
    const { xPercent, yPercent } = floorPosition(DEFAULT_CAT_POSITION);
    expect(xPercent).toBeGreaterThan(0);
    expect(xPercent).toBeLessThan(100);
    expect(yPercent).toBeGreaterThan(FLOOR_REGION.top * 100);
    expect(yPercent).toBeLessThan(100);
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

  it('validates against the real floor and wall region sizes', () => {
    expect(isValidFloorPosition({ row: FLOOR_ROWS - 1, col: FLOOR_COLS - 1 })).toBe(true);
    expect(isValidFloorPosition({ row: FLOOR_ROWS, col: 0 })).toBe(false);
    expect(isValidWallPosition({ row: WALL_ROWS - 1, col: WALL_COLS - 1 })).toBe(true);
    expect(isValidWallPosition({ row: WALL_ROWS, col: 0 })).toBe(false);
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
