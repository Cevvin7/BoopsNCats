import {
  FLOOR_ROWS,
  FLOOR_COLS,
  WALL_ROWS,
  WALL_COLS,
  WALL_FACES,
  isValidFloorPosition,
  isValidWallPosition,
  isAgainstWall,
  isInHangableWallZone,
} from '../room/roomGrid.js';
import { ITEM_CATALOG, PlacementType, DEFAULT_FOOTPRINT, getFootprint } from './itemCatalog.js';
import { getPlacedFace } from './placedItemsModel.js';

// onWall items live on one of the two wall faces; both floor placementTypes
// (freeStand and onFloorAgainstWall) live on the floor grid. Occupancy
// only ever conflicts within the same region — and, for walls, the same
// face — since a left-wall tile and a right-wall tile (or a wall tile and
// a floor tile) can share {row, col} numbers without being the same spot.
export function regionForPlacementType(placementType) {
  return placementType === PlacementType.ON_WALL ? 'wall' : 'floor';
}

function samePosition(a, b) {
  return a.row === b.row && a.col === b.col;
}

/** Expands an anchor position (its top-left tile) into every tile a footprint covers. */
export function getFootprintTiles(anchor, footprint) {
  const tiles = [];
  for (let dRow = 0; dRow < footprint.height; dRow++) {
    for (let dCol = 0; dCol < footprint.width; dCol++) {
      tiles.push({ row: anchor.row + dRow, col: anchor.col + dCol });
    }
  }
  return tiles;
}

function getPlacedItemTiles(placedItem) {
  const catalogEntry = ITEM_CATALOG[placedItem.itemId];
  return getFootprintTiles(placedItem, getFootprint(catalogEntry));
}

/**
 * A position (the footprint's anchor/top-left tile) is valid for a given
 * placementType if:
 *  1. every tile the footprint covers is in-bounds for that type's region
 *     (floor grid vs a specific wall face)
 *  2. for onFloorAgainstWall, every one of those tiles is also in the
 *     floor row that borders the wall (roomGrid.isAgainstWall) — in
 *     practice this means the footprint's height must be 1, since no row
 *     other than the front one can ever be "against the wall"
 *  3. for onWall, every tile is also outside the kickboard band
 *     (roomGrid.isInHangableWallZone)
 *  4. none of those tiles are already occupied by another placed item's
 *     own footprint, in that same region (and, for walls, same face) —
 *     excludePlacedItemId lets a placed item's own current tiles not
 *     count as "occupied by itself" while it's being moved
 */
export function isValidPlacementPosition({
  placementType,
  footprint = DEFAULT_FOOTPRINT,
  position,
  face,
  placedItems,
  excludePlacedItemId,
}) {
  const region = regionForPlacementType(placementType);
  const footprintTiles = getFootprintTiles(position, footprint);

  for (const tile of footprintTiles) {
    if (region === 'wall') {
      if (!isValidWallPosition({ face, ...tile })) return false;
      if (!isInHangableWallZone(tile)) return false;
    } else {
      if (!isValidFloorPosition(tile)) return false;
      if (placementType === PlacementType.ON_FLOOR_AGAINST_WALL && !isAgainstWall(tile)) return false;
    }
  }

  const isOccupied = placedItems.some((placed) => {
    if (placed.id === excludePlacedItemId) return false;

    const placedRegion = regionForPlacementType(ITEM_CATALOG[placed.itemId].placementType);
    if (placedRegion !== region) return false;
    if (region === 'wall' && getPlacedFace(placed) !== face) return false;

    const placedTiles = getPlacedItemTiles(placed);
    return placedTiles.some((placedTile) => footprintTiles.some((tile) => samePosition(placedTile, tile)));
  });

  return !isOccupied;
}

/**
 * Enumerates every valid anchor position for a placementType — this is
 * what drives tile highlighting. For onWall this checks BOTH faces and
 * tags each returned position with which one it's on, since either wall
 * is a legitimate choice for a wall-mounted item. The room is small
 * enough (64 floor tiles, 2 x 32 wall tiles) that brute-force checking
 * every anchor cell is cheap enough to redo on every selection change.
 */
export function getValidPositions({
  placementType,
  footprint = DEFAULT_FOOTPRINT,
  placedItems,
  excludePlacedItemId,
}) {
  const region = regionForPlacementType(placementType);
  const positions = [];

  if (region === 'wall') {
    for (const face of WALL_FACES) {
      for (let row = 0; row < WALL_ROWS; row++) {
        for (let col = 0; col < WALL_COLS; col++) {
          const position = { row, col };
          if (isValidPlacementPosition({ placementType, footprint, position, face, placedItems, excludePlacedItemId })) {
            positions.push({ face, row, col });
          }
        }
      }
    }
    return positions;
  }

  for (let row = 0; row < FLOOR_ROWS; row++) {
    for (let col = 0; col < FLOOR_COLS; col++) {
      const position = { row, col };
      if (isValidPlacementPosition({ placementType, footprint, position, placedItems, excludePlacedItemId })) {
        positions.push(position);
      }
    }
  }
  return positions;
}
