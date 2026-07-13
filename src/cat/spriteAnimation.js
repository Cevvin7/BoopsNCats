import catSpriteData from './cat-black-json.json';

/**
 * Groups an Aseprite export's frames into named animations using the
 * "(AnimationName)" segment baked into each frame's key. This sheet's
 * frameTags array is empty — Aseprite only exports frameTags if you
 * defined them before exporting, and this file's animations were built as
 * separate layers (SitIdle/StandIdle/Walking/NeedsExercise) instead, so
 * the layer name ends up embedded in each frame's filename rather than in
 * a proper tag. Frame order within an animation is taken from the
 * trailing index in the filename, not object key order, so this stays
 * correct even if a future export lists frames out of sequence.
 */
function groupFramesByAnimation(framesObject) {
  const animations = {};

  for (const [frameName, frameData] of Object.entries(framesObject)) {
    const nameMatch = frameName.match(/\(([^)]+)\)/);
    const indexMatch = frameName.match(/(\d+)\.aseprite$/);
    const animationName = nameMatch ? nameMatch[1] : 'default';
    const frameIndex = indexMatch ? Number(indexMatch[1]) : 0;

    if (!animations[animationName]) animations[animationName] = [];
    animations[animationName].push({ ...frameData.frame, index: frameIndex, duration: frameData.duration });
  }

  for (const frames of Object.values(animations)) {
    frames.sort((a, b) => a.index - b.index);
  }

  return animations;
}

export const CAT_SPRITE_SHEET_URL = '/sprites/cat/cat-black-sprite.png';
export const CAT_SHEET_WIDTH = catSpriteData.meta.size.w;
export const CAT_SHEET_HEIGHT = catSpriteData.meta.size.h;
export const CAT_ANIMATIONS = groupFramesByAnimation(catSpriteData.frames);
