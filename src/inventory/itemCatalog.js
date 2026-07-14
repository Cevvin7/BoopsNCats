export const PlacementType = Object.freeze({
  FREE_STAND: 'freeStand',
  ON_FLOOR_AGAINST_WALL: 'onFloorAgainstWall',
  ON_WALL: 'onWall',
});

export const DEFAULT_FOOTPRINT = { width: 1, height: 1 };

// Catalog entries may omit `footprint` entirely for a plain 1x1 item —
// this is the one place that fills in the default, so every other module
// (placement validity, rendering) can just call getFootprint(entry) and
// always get a real {width, height} back.
export function getFootprint(catalogEntry) {
  return catalogEntry.footprint ?? DEFAULT_FOOTPRINT;
}

// Placeholder visuals only (a flat color) until real sprites exist for
// these items — swap in a spriteUrl per entry later; PlacedItemSprite
// already has the one seam that would need to branch on it.
//
// Footprints here are deliberately non-trivial (rather than everything
// defaulting to 1x1) so the multi-tile system is actually exercised:
// bookshelf spans 2 columns along the back wall (still 1 row deep, since
// onFloorAgainstWall requires *every* footprint tile to be in the
// against-wall row — see placement.js), plant is a 2x2 floor footprint,
// and shelf is a 4-wide wall-mounted footprint.
export const ITEM_CATALOG = {
  bookshelf: {
    id: 'bookshelf',
    name: 'Bookshelf',
    placementType: PlacementType.ON_FLOOR_AGAINST_WALL,
    footprint: { width: 2, height: 1 },
    color: '#8b5e3c',
  },
  plant: {
    id: 'plant',
    name: 'Plant',
    placementType: PlacementType.FREE_STAND,
    footprint: { width: 2, height: 2 },
    color: '#4cc994',
  },
  shelf: {
    id: 'shelf',
    name: 'Shelf',
    placementType: PlacementType.ON_WALL,
    footprint: { width: 4, height: 1 },
    color: '#c9a15a',
  },
  bookshelfTall: {
    id: 'bookshelfTall',
    name: 'Tall Bookshelf',
    placementType: PlacementType.ON_FLOOR_AGAINST_WALL,
    footprint: { width: 1, height: 1 },
    // spriteHeightPx is the item's own art canvas height, in native (1x)
    // pixels -- deliberately independent of footprint (which only says how
    // much floor space its base occupies). This is what lets the sprite
    // rise up above its single floor tile instead of being squashed to
    // fit it; see the sizing comment in Room.jsx for the general rule.
    spriteHeightPx: 80,
    spriteUrl: `${import.meta.env.BASE_URL}sprites/furniture/furniture-bookshelf2xtall.png`,
    color: '#6b4a30',
  },
};
