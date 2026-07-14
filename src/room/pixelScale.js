// Native pixel resolution of the game's pixel-art assets. Rendering must
// land on an exact integer multiple of these numbers -- a fluid/percentage
// size (the room's old width:100%; max-width:480px) almost never lands on
// a whole multiple of a 32px sprite frame, and image-rendering: pixelated
// (nearest-neighbor) at a non-integer ratio duplicates some source pixels
// more than others than others, which is the "flat/smeared" look. Fixed
// integer-pixel sizing is the actual fix; the CSS property alone wasn't
// the problem.
export const SPRITE_NATIVE_PX = 32; // cat + item sprite frames, per tile of footprint
export const ROOM_ART_NATIVE_WIDTH_PX = 512;
export const ROOM_ART_NATIVE_HEIGHT_PX = 448;

// "1x" is genuinely native/unscaled resolution, not a hidden multiplier --
// "2x" is exactly double that, matching the toggle's name literally.
export const PIXEL_SCALES = Object.freeze({ NORMAL: 1, DOUBLED: 2 });
