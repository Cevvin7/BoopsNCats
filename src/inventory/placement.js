import {
  FLOOR_ROWS,
  FLOOR_COLS,
  WALL_ROWS,
  WALL_COLS,
  isValidFloorPosition,
  isValidWallPosition,
  isAgainstWall,
  isInHangableWallZone,
} from '../room/roomGrid.js';
import { ITEM_CATALOG, PlacementType } from './itemCatalog.js';

// onWall items live on the wall grid; both floor placementTypes
// (freeStand and onFloorAgainstWall) live on the floor grid. Occupancy
// only ever conflicts within the same region — a wall tile and a floor
// tile can share the same {row, col} numbers without being the same spot.
export function regionForPlacementType(placementType) {
  return placementType === PlacementType.ON_WALL ? 'wall' : 'floor';
}

function samePosition(a, b) {
  return a.row === b.row && a.col === b.col;
}

/**
 * A position is valid for a given placementType if:
 *  1. it's in-bounds for that type's region (floor grid vs wall grid)
 *  2. for onFloorAgainstWall specifically, it's also in the floor row
 *     that borders the wall (roomGrid.isAgainstWall) — see the
 *     explanation on that function for why it's row-based rather than a
 *     per-column check against the wall grid
 *  2b. for onWall specifically, it's also outside the kickboard band
 *     (roomGrid.isInHangableWallZone) — the bottom rows of the wall grid
 *     render as a floor/wall transition strip and are never mountable
 *  3. nothing else is already occupying that exact tile in that region
 *     (excludePlacedItemId lets a placed item's own current tile not
 *     count as "occupied by itself" while it's being moved)
 */
export function isValidPlacementPosition({ placementType, position, placedItems, excludePlacedItemId }) {
  const region = regionForPlacementType(placementType);

  if (region === 'wall') {
    if (!isValidWallPosition(position)) return false;
    if (!isInHangableWallZone(position)) return false;
  } else {
    if (!isValidFloorPosition(position)) return false;
    if (placementType === PlacementType.ON_FLOOR_AGAINST_WALL && !isAgainstWall(position)) return false;
  }

  const isOccupied = placedItems.some((placed) => {
    if (placed.id === excludePlacedItemId) return false;
    const placedRegion = regionForPlacementType(ITEM_CATALOG[placed.itemId].placementType);
    return placedRegion === region && samePosition(placed, position);
  });

  return !isOccupied;
}

/**
 * Enumerates every valid position for a placementType — this is what
 * drives tile highlighting: the room only ever has 64 floor tiles and 15
 * wall tiles, so brute-force checking every cell is cheap enough to redo
 * on every selection change rather than maintaining an incremental index.
 */
export function getValidPositions({ placementType, placedItems, excludePlacedItemId }) {
  const region = regionForPlacementType(placementType);
  const rows = region === 'wall' ? WALL_ROWS : FLOOR_ROWS;
  const cols = region === 'wall' ? WALL_COLS : FLOOR_COLS;

  const positions = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const position = { row, col };
      if (isValidPlacementPosition({ placementType, position, placedItems, excludePlacedItemId })) {
        positions.push(position);
      }
    }
  }
  return positions;
}
