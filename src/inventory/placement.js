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

// Catalog footprints describe an item's footprint in its default ("right
// wall") orientation -- width along columns, height along rows. The
// room's two wall-adjacent floor edges run along DIFFERENT axes (row 0
// runs along columns, col 0 runs along rows -- see roomGrid.js's
// wallCorner comment), so an onFloorAgainstWall item hugging the left
// edge instead needs that same footprint transposed, or a >1-tile item
// could never actually lie flush against it. Every other placementType
// (and the default/undefined 'right' face) uses the footprint exactly
// as the catalog defines it.
function orientedFootprint(placementType, footprint, face) {
  if (placementType === PlacementType.ON_FLOOR_AGAINST_WALL && face === 'left') {
    return { width: footprint.height, height: footprint.width };
  }
  return footprint;
}

// Existing placed items (and any candidate position with no explicit
// face) predate onFloorAgainstWall's two-wall support and were always
// implicitly against the row-0 ("right") edge -- unlike onWall's
// getPlacedFace, which defaults to 'left' for its own unrelated reason.
export function getFloorAgainstWallFace(placedItem) {
  return placedItem.face ?? 'right';
}

/**
 * The screen-space footprint to actually use for an already-placed item
 * -- accounting for which wall an onFloorAgainstWall item is against
 * (see orientedFootprint above). Every other placementType's footprint
 * passes through unchanged. Shared by collision-tile computation here
 * and by Room.jsx's rendering, so the two can never disagree about which
 * tiles an item occupies.
 */
export function orientedFootprintForPlacedItem(placedItem) {
  const catalogEntry = ITEM_CATALOG[placedItem.itemId];
  const face =
    catalogEntry.placementType === PlacementType.ON_FLOOR_AGAINST_WALL
      ? getFloorAgainstWallFace(placedItem)
      : undefined;
  return orientedFootprint(catalogEntry.placementType, getFootprint(catalogEntry), face);
}

function getPlacedItemTiles(placedItem) {
  return getFootprintTiles(placedItem, orientedFootprintForPlacedItem(placedItem));
}

function tileKey({ row, col }) {
  return `${row},${col}`;
}

/**
 * Every floor tile currently covered by a placed item's own footprint, as
 * a Set of "row,col" keys. Wall-mounted items don't occupy any floor
 * tile, so they're excluded entirely. Used by the cat's wander-
 * destination picker to avoid choosing a tile that's actually furniture.
 */
export function getOccupiedFloorTiles(placedItems) {
  const occupied = new Set();
  for (const placed of placedItems) {
    const catalogEntry = ITEM_CATALOG[placed.itemId];
    if (regionForPlacementType(catalogEntry.placementType) !== 'floor') continue;
    for (const tile of getPlacedItemTiles(placed)) {
      occupied.add(tileKey(tile));
    }
  }
  return occupied;
}

/**
 * A position (the footprint's anchor/top-left tile) is valid for a given
 * placementType if:
 *  1. every tile the footprint covers is in-bounds for that type's region
 *     (floor grid vs a specific wall face)
 *  2. for onFloorAgainstWall, every one of those tiles is also against
 *     the named wall (`face`, defaulting to 'right' -- see
 *     roomGrid.isAgainstWall and orientedFootprint above) — in practice
 *     this means the footprint's cross-wall dimension must be 1, since
 *     no other row (against the right wall) or column (against the
 *     left wall) is ever "against" it
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
  const footprintTiles = getFootprintTiles(position, orientedFootprint(placementType, footprint, face));

  for (const tile of footprintTiles) {
    if (region === 'wall') {
      if (!isValidWallPosition({ face, ...tile })) return false;
      if (!isInHangableWallZone(tile)) return false;
    } else {
      if (!isValidFloorPosition(tile)) return false;
      if (placementType === PlacementType.ON_FLOOR_AGAINST_WALL && !isAgainstWall(tile, face)) return false;
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
 * what drives tile highlighting. For onWall AND onFloorAgainstWall this
 * checks BOTH walls and tags each returned position with which one it's
 * on, since either is a legitimate choice; freeStand has no wall concept
 * at all. The room is small enough (64 floor tiles, 2 x 32 wall tiles)
 * that brute-force checking every anchor cell is cheap enough to redo on
 * every selection change.
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

  if (placementType === PlacementType.ON_FLOOR_AGAINST_WALL) {
    // Both walls share the back-corner tile (0,0), where the anchor is
    // valid under EITHER orientation at once (e.g. a 2-wide footprint's
    // normal right-wall shape and its transposed left-wall shape both
    // fit there). Both faces' markers would then render at the exact
    // same on-screen tile, and whichever renders last would always
    // intercept the tap meant for the other -- claimedAnchors keeps
    // each anchor tile in the results only once, so every returned
    // position stays individually reachable.
    const claimedAnchors = new Set();
    for (const face of WALL_FACES) {
      for (let row = 0; row < FLOOR_ROWS; row++) {
        for (let col = 0; col < FLOOR_COLS; col++) {
          const anchorKey = tileKey({ row, col });
          if (claimedAnchors.has(anchorKey)) continue;
          const position = { row, col };
          if (isValidPlacementPosition({ placementType, footprint, position, face, placedItems, excludePlacedItemId })) {
            positions.push({ face, row, col });
            claimedAnchors.add(anchorKey);
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
