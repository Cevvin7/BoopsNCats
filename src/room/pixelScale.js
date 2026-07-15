// ROOM_ART_NATIVE_WIDTH_PX/HEIGHT_PX used to live here as hardcoded
// numbers measured off the room's old pre-rendered art; they're now
// derived directly from the tile grid in roomGrid.js instead (see
// ROOM_ART_NATIVE_WIDTH_PX/HEIGHT_PX there), so import from there.

// The cat's own sprite sheet frame really is 32x32 (see cat-black-json.json)
// -- unlike placed items, the cat isn't meant to fill its whole floor tile,
// so it keeps its own native pixel size rather than being sized to the
// tile's footprint rect.
export const CAT_SPRITE_NATIVE_PX = 32;

// 2x is now the permanent, only rendering scale -- there is no user-facing
// 1x/2x toggle anymore.
export const PIXEL_SCALE = 2;
