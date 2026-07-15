import { DISCOVERED_ITEMS } from 'virtual:item-catalog';

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

// Every item lives as its own folder under public/items/<id>/ -- one JSON
// descriptor (name/placementType/footprint/optional spriteHeightPx+color+
// sprite filename), plus a sprite image if it has real art yet. Adding a
// new item is just dropping a folder in; vite-plugins/itemCatalogPlugin.js
// discovers them at build/dev time (import.meta.glob can't see into
// public/, so a plain glob can't do this) and this module turns that raw
// discovery into the shaped catalog the rest of the app reads. `sprite`
// (just a filename, not a path) becomes a full spriteUrl here so every
// consumer keeps reading a ready-to-use URL, same as before this moved to
// per-item files.
export const ITEM_CATALOG = Object.fromEntries(
  DISCOVERED_ITEMS.map(({ sprite, ...entry }) => [
    entry.id,
    {
      ...entry,
      ...(sprite ? { spriteUrl: `${import.meta.env.BASE_URL}items/${entry.id}/${sprite}` } : {}),
    },
  ]),
);
