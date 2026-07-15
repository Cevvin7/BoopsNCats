/**
 * background-size/background-position for selecting one frame out of a
 * horizontal sprite-sheet strip -- percentage-based (not fixed native
 * pixels) so the same style works correctly at any element size the
 * strip ends up rendered at, the same technique CatSprite.jsx uses for
 * its own sprite sheet.
 */
export function spriteStripBackgroundStyle({ frameCount, frameIndex }) {
  return {
    backgroundSize: `${frameCount * 100}% 100%`,
    backgroundPosition: frameCount <= 1 ? '0% 0%' : `${(frameIndex / (frameCount - 1)) * 100}% 0%`,
  };
}
