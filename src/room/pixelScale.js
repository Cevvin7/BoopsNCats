// Native pixel resolution of the room's source art. Rendering must land on
// an exact integer multiple of these numbers -- a fluid/percentage size
// (the room's old width:100%; max-width:480px) almost never lands on a
// whole multiple of a source pixel, and image-rendering: pixelated
// (nearest-neighbor) at a non-integer ratio duplicates some source pixels
// more than others, which is the "flat/smeared" look. Fixed integer-pixel
// sizing is the actual fix; the CSS property alone wasn't the problem.
export const ROOM_ART_NATIVE_WIDTH_PX = 512;
export const ROOM_ART_NATIVE_HEIGHT_PX = 448;

// The cat's own sprite sheet frame really is 32x32 (see cat-black-json.json)
// -- unlike placed items, the cat isn't meant to fill its whole floor tile,
// so it keeps its own native pixel size rather than being sized to the
// tile's footprint rect.
export const CAT_SPRITE_NATIVE_PX = 32;

// 2x is now the permanent, only rendering scale -- there is no user-facing
// 1x/2x toggle anymore.
export const PIXEL_SCALE = 2;
