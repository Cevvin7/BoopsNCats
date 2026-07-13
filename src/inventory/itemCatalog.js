export const PlacementType = Object.freeze({
  FREE_STAND: 'freeStand',
  ON_FLOOR_AGAINST_WALL: 'onFloorAgainstWall',
  ON_WALL: 'onWall',
});

// Placeholder visuals only (a flat color) until real sprites exist for
// these items — swap in a spriteUrl per entry later; PlacedItemSprite
// already has the one seam that would need to branch on it.
export const ITEM_CATALOG = {
  bookshelf: {
    id: 'bookshelf',
    name: 'Bookshelf',
    placementType: PlacementType.ON_FLOOR_AGAINST_WALL,
    color: '#8b5e3c',
  },
  plant: {
    id: 'plant',
    name: 'Plant',
    placementType: PlacementType.FREE_STAND,
    color: '#4cc994',
  },
  shelf: {
    id: 'shelf',
    name: 'Shelf',
    placementType: PlacementType.ON_WALL,
    color: '#c9a15a',
  },
};
