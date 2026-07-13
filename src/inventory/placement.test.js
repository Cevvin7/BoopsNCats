import { describe, it, expect } from 'vitest';
import {
  isValidPlacementPosition,
  getValidPositions,
  getFootprintTiles,
  regionForPlacementType,
} from './placement.js';
import { PlacementType, ITEM_CATALOG, getFootprint } from './itemCatalog.js';
import { FLOOR_ROWS, FLOOR_COLS, WALL_COLS, WALL_HANGABLE_ROWS } from '../room/roomGrid.js';

describe('regionForPlacementType', () => {
  it('maps onWall to the wall region and both floor types to the floor region', () => {
    expect(regionForPlacementType(PlacementType.ON_WALL)).toBe('wall');
    expect(regionForPlacementType(PlacementType.FREE_STAND)).toBe('floor');
    expect(regionForPlacementType(PlacementType.ON_FLOOR_AGAINST_WALL)).toBe('floor');
  });
});

describe('getFootprintTiles', () => {
  it('expands a 1x1 footprint to just the anchor tile', () => {
    expect(getFootprintTiles({ row: 3, col: 4 }, { width: 1, height: 1 })).toEqual([{ row: 3, col: 4 }]);
  });

  it('expands a 2x2 footprint to 4 tiles growing right and down from the anchor', () => {
    expect(getFootprintTiles({ row: 1, col: 1 }, { width: 2, height: 2 })).toEqual([
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
    ]);
  });

  it('expands a wide 4x1 footprint along columns only', () => {
    expect(getFootprintTiles({ row: 0, col: 2 }, { width: 4, height: 1 })).toEqual([
      { row: 0, col: 2 },
      { row: 0, col: 3 },
      { row: 0, col: 4 },
      { row: 0, col: 5 },
    ]);
  });
});

describe('isValidPlacementPosition: freeStand with a multi-tile footprint', () => {
  const footprint = { width: 2, height: 2 };

  it('accepts a 2x2 anchor when all 4 tiles are in-bounds and open', () => {
    expect(
      isValidPlacementPosition({ placementType: PlacementType.FREE_STAND, footprint, position: { row: 3, col: 3 }, placedItems: [] }),
    ).toBe(true);
  });

  it('rejects when any tile of the footprint would fall out of bounds', () => {
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.FREE_STAND,
        footprint,
        position: { row: FLOOR_ROWS - 1, col: 0 }, // bottom row -> footprint's 2nd row is off the grid
        placedItems: [],
      }),
    ).toBe(false);
  });

  it('rejects when the footprint overlaps another placed item at any shared tile, not just the anchor', () => {
    // A 1x1 item sitting at the far corner of where the 2x2 footprint would land.
    const placedItems = [{ id: 'a', itemId: 'plant', row: 4, col: 4, flipped: false }];
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.FREE_STAND,
        footprint,
        position: { row: 3, col: 3 }, // covers (3,3) (3,4) (4,3) (4,4) -- shares (4,4)
        placedItems,
      }),
    ).toBe(false);
  });

  it('accepts an adjacent (non-overlapping) footprint next to an existing item', () => {
    const placedItems = [{ id: 'a', itemId: 'plant', row: 4, col: 4, flipped: false }];
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.FREE_STAND,
        footprint,
        position: { row: 0, col: 0 }, // covers (0,0)(0,1)(1,0)(1,1) -- no overlap
        placedItems,
      }),
    ).toBe(true);
  });
});

describe('isValidPlacementPosition: onFloorAgainstWall with a wide footprint', () => {
  const footprint = { width: 2, height: 1 };

  it('accepts a footprint fully within row 0', () => {
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.ON_FLOOR_AGAINST_WALL,
        footprint,
        position: { row: 0, col: 3 },
        placedItems: [],
      }),
    ).toBe(true);
  });

  it('rejects if the anchor is not row 0, even though every tile is in-bounds', () => {
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.ON_FLOOR_AGAINST_WALL,
        footprint,
        position: { row: 1, col: 3 },
        placedItems: [],
      }),
    ).toBe(false);
  });

  it('rejects a footprint taller than 1 row -- no row besides 0 is ever "against the wall"', () => {
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.ON_FLOOR_AGAINST_WALL,
        footprint: { width: 1, height: 2 },
        position: { row: 0, col: 3 },
        placedItems: [],
      }),
    ).toBe(false);
  });
});

describe('isValidPlacementPosition: onWall with a wide footprint and faces', () => {
  const footprint = { width: 4, height: 1 };

  it('accepts a footprint fully within the hangable zone of one face', () => {
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.ON_WALL,
        footprint,
        position: { row: 0, col: 0 },
        face: 'left',
        placedItems: [],
      }),
    ).toBe(true);
  });

  it('rejects if any covered tile falls in the kickboard band', () => {
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.ON_WALL,
        footprint: { width: 1, height: 1 },
        position: { row: WALL_HANGABLE_ROWS, col: 0 }, // first kickboard row
        face: 'left',
        placedItems: [],
      }),
    ).toBe(false);
  });

  it('rejects if the footprint would run off the edge of the face (only 8 columns)', () => {
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.ON_WALL,
        footprint,
        position: { row: 0, col: WALL_COLS - 2 }, // only 2 columns remain, footprint needs 4
        face: 'left',
        placedItems: [],
      }),
    ).toBe(false);
  });

  it('treats the two faces as independent -- an item on the left does not block the same coordinates on the right', () => {
    const placedItems = [{ id: 'a', itemId: 'shelf', row: 0, col: 0, face: 'left', flipped: false }];
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.ON_WALL,
        footprint,
        position: { row: 0, col: 0 },
        face: 'right',
        placedItems,
      }),
    ).toBe(true);
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.ON_WALL,
        footprint,
        position: { row: 0, col: 0 },
        face: 'left',
        placedItems,
      }),
    ).toBe(false);
  });
});

describe('isValidPlacementPosition: excludePlacedItemId (for moving)', () => {
  it("lets a footprint item's own current tiles be selected again while moving it", () => {
    const footprint = { width: 2, height: 2 };
    const placedItems = [{ id: 'a', itemId: 'plant', row: 4, col: 4, flipped: false }];
    expect(
      isValidPlacementPosition({
        placementType: PlacementType.FREE_STAND,
        footprint,
        position: { row: 4, col: 4 },
        placedItems,
        excludePlacedItemId: 'a',
      }),
    ).toBe(true);
  });
});

describe('getValidPositions with footprints', () => {
  it('shrinks the freeStand anchor range for a 2x2 footprint (anchor cannot be in the last row/col)', () => {
    const positions = getValidPositions({
      placementType: PlacementType.FREE_STAND,
      footprint: { width: 2, height: 2 },
      placedItems: [],
    });
    expect(positions).toHaveLength((FLOOR_ROWS - 1) * (FLOOR_COLS - 1));
    expect(positions.every((p) => p.row <= FLOOR_ROWS - 2 && p.col <= FLOOR_COLS - 2)).toBe(true);
  });

  it('lists only row-0 anchors for a wide onFloorAgainstWall footprint', () => {
    const footprint = { width: 2, height: 1 };
    const positions = getValidPositions({ placementType: PlacementType.ON_FLOOR_AGAINST_WALL, footprint, placedItems: [] });
    expect(positions).toHaveLength(FLOOR_COLS - 1); // anchor col 0..6
    expect(positions.every((p) => p.row === 0)).toBe(true);
  });

  it('lists positions on both faces for a wide onWall footprint', () => {
    const footprint = { width: 4, height: 1 };
    const positions = getValidPositions({ placementType: PlacementType.ON_WALL, footprint, placedItems: [] });
    const perFace = WALL_HANGABLE_ROWS * (WALL_COLS - footprint.width + 1);
    expect(positions.filter((p) => p.face === 'left')).toHaveLength(perFace);
    expect(positions.filter((p) => p.face === 'right')).toHaveLength(perFace);
    expect(positions).toHaveLength(perFace * 2);
  });

  it('shrinks only the occupied face\'s count, by the placed item\'s OWN footprint (not the query\'s), leaving the other face untouched', () => {
    const queryFootprint = { width: 1, height: 1 };
    const placedItems = [{ id: 'a', itemId: 'shelf', row: 0, col: 0, face: 'left', flipped: false }];
    const positions = getValidPositions({ placementType: PlacementType.ON_WALL, footprint: queryFootprint, placedItems });
    const fullPerFace = WALL_HANGABLE_ROWS * WALL_COLS;
    const shelfFootprint = getFootprint(ITEM_CATALOG.shelf);
    const occupiedTileCount = shelfFootprint.width * shelfFootprint.height;
    expect(positions.filter((p) => p.face === 'left')).toHaveLength(fullPerFace - occupiedTileCount);
    expect(positions.filter((p) => p.face === 'right')).toHaveLength(fullPerFace);
  });
});
