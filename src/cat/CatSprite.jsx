import { MAX_HAPPINESS } from './happinessModel.js';
import { useSpriteFrame } from './useSpriteFrame.js';
import { CAT_SPRITE_SHEET_URL, CAT_SHEET_WIDTH, CAT_SHEET_HEIGHT } from './spriteAnimation.js';
import './CatSprite.css';

// needsAttention overrides whatever the wander system (useCatWander) was
// showing with a dedicated "wants a walk" pose -- `animationName`
// (SitIdle/StandIdle while idle, Walking while wandering) only applies
// once that's resolved.
export function CatSprite({ happiness, needsAttention, animationName }) {
  const displayedAnimation = needsAttention ? 'NeedsExercise' : animationName;
  const frame = useSpriteFrame(displayedAnimation);
  if (!frame) return null;

  const statusText = needsAttention ? 'Needs attention!' : `Happy (${happiness}/${MAX_HAPPINESS})`;

  // Percentage-based background-size/position (rather than fixed pixels)
  // so the sprite sheet stays crisp and correctly framed at any rendered
  // size — the same "percentages scale for free" idea as roomGrid.js's
  // coordinate projection.
  const backgroundSizePercent = {
    x: (CAT_SHEET_WIDTH / frame.w) * 100,
    y: (CAT_SHEET_HEIGHT / frame.h) * 100,
  };
  const backgroundPositionPercent = {
    x: frame.w === CAT_SHEET_WIDTH ? 0 : (frame.x / (CAT_SHEET_WIDTH - frame.w)) * 100,
    y: frame.h === CAT_SHEET_HEIGHT ? 0 : (frame.y / (CAT_SHEET_HEIGHT - frame.h)) * 100,
  };

  return (
    <div
      className="cat-sprite"
      title={statusText}
      aria-label={`Cat status: ${statusText}`}
      style={{
        backgroundImage: `url(${CAT_SPRITE_SHEET_URL})`,
        backgroundSize: `${backgroundSizePercent.x}% ${backgroundSizePercent.y}%`,
        backgroundPosition: `${backgroundPositionPercent.x}% ${backgroundPositionPercent.y}%`,
      }}
    />
  );
}
