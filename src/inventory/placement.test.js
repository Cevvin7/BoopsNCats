import { describe, it, expect } from 'vitest';
import { isValidPlacementPosition, getValidPositions, regionForPlacementType } from './placement.js';
import { PlacementType } from './itemCatalog.js';
import { FLOOR_ROWS, FLOOR_COLS, WALL_ROWS, WALL_COLS } from '../room/roomGrid.js';

describe('regionForPlacementType', () => {
  it('maps onWall to the wall region and both floor types to the floor region', () => {
    expect(regionForPlacementType(PlacementType.ON_WALL)).toBe('wall');
    expect(regionForPlacementType(PlacementType.FREE_STAND)).toBe('floor');
    expect(regionForPlacementType(PlacementType.ON_FLOOR_AGAINST_WALL)).toBe('floor');
  });
});

describe('isValidPlacementPosition: freeStand', () => {
  it('accepts any in-bounds floor tile and rejects out-of-bounds', () => {
    expect(
      isValidPlacementPosition({ placementType: PlacementType.FREE_STAND, position: { row: 4, col: 4 }, placedItems: [] }),
    ).toBe(true);
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.FREE_STAND,
        position: { row: FLOOR_ROWS, col: 0 },
        placedItems: [],
      }),
    ).toBe(false);
  });

  it('rejects a tile already occupied by another floor item', () => {
    const placedItems = [{ id: 'a', itemId: 'plant', row: 4, col: 4, flipped: false }];
    expect(
      isValidPlacementPosition({ placementType: PlacementType.FREE_STAND, position: { row: 4, col: 4 }, placedItems }),
    ).toBe(false);
  });

  it('does not conflict with a wall item at the same numeric row/col', () => {
    const placedItems = [{ id: 'a', itemId: 'shelf', row: 0, col: 0, flipped: false }];
    expect(
      isValidPlacementPosition({ placementType: PlacementType.FREE_STAND, position: { row: 0, col: 0 }, placedItems }),
    ).toBe(true);
  });
});

describe('isValidPlacementPosition: onFloorAgainstWall', () => {
  it('accepts row 0 and rejects every other row, even in-bounds ones', () => {
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.ON_FLOOR_AGAINST_WALL,
        position: { row: 0, col: 3 },
        placedItems: [],
      }),
    ).toBe(true);
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.ON_FLOOR_AGAINST_WALL,
        position: { row: 1, col: 3 },
        placedItems: [],
      }),
    ).toBe(false);
  });
});

describe('isValidPlacementPosition: onWall', () => {
  it('accepts any in-bounds wall tile and rejects out-of-bounds', () => {
    expect(
      isValidPlacementPosition({ placementType: PlacementType.ON_WALL, position: { row: 0, col: 0 }, placedItems: [] }),
    ).toBe(true);
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.ON_WALL,
        position: { row: WALL_ROWS, col: 0 },
        placedItems: [],
      }),
    ).toBe(false);
  });
});

describe('isValidPlacementPosition: excludePlacedItemId (for moving)', () => {
  it("lets an item's own current tile be selected again while moving it", () => {
    const placedItems = [{ id: 'a', itemId: 'plant', row: 4, col: 4, flipped: false }];
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.FREE_STAND,
        position: { row: 4, col: 4 },
        placedItems,
        excludePlacedItemId: 'a',
      }),
    ).toBe(true);
    // A different placed item's tile still blocks, even during a move.
    const twoItems = [...placedItems, { id: 'b', itemId: 'plant', row: 1, col: 1, flipped: false }];
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.FREE_STAND,
        position: { row: 1, col: 1 },
        placedItems: twoItems,
        excludePlacedItemId: 'a',
      }),
    ).toBe(false);
  });
});

describe('getValidPositions', () => {
  it('lists every floor tile for freeStand on an empty room', () => {
    const positions = getValidPositions({ placementType: PlacementType.FREE_STAND, placedItems: [] });
    expect(positions).toHaveLength(FLOOR_ROWS * FLOOR_COLS);
  });

  it('lists only row-0 tiles for onFloorAgainstWall on an empty room', () => {
    const positions = getValidPositions({ placementType: PlacementType.ON_FLOOR_AGAINST_WALL, placedItems: [] });
    expect(positions).toHaveLength(FLOOR_COLS);
    expect(positions.every((p) => p.row === 0)).toBe(true);
  });

  it('lists every wall tile for onWall on an empty room', () => {
    const positions = getValidPositions({ placementType: PlacementType.ON_WALL, placedItems: [] });
    expect(positions).toHaveLength(WALL_ROWS * WALL_COLS);
  });

  it('shrinks by exactly one per occupied tile of the same region', () => {
    const placedItems = [{ id: 'a', itemId: 'plant', row: 2, col: 2, flipped: false }];
    const positions = getValidPositions({ placementType: PlacementType.FREE_STAND, placedItems });
    expect(positions).toHaveLength(FLOOR_ROWS * FLOOR_COLS - 1);
    expect(positions.some((p) => p.row === 2 && p.col === 2)).toBe(false);
  });
});
